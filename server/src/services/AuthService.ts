import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sequelize } from '../models';
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { generateToken } from '../config/jwt';
import { sendEmail, otpEmailTemplate, resetPasswordEmailTemplate } from '../config/email';
import { uploadToCloudinary } from '../config/cloudinary';

import { redisClient } from '../config/redis';

export class AuthService {
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.walletRepository = new WalletRepository();
  }

  // ─── Redis Cache Helpers for Registration ────────────────────────────────
  private async getPendingRegistration(email: string): Promise<any | null> {
    try {
      const key = `reg_pending:${email.toLowerCase().trim()}`;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn('[Redis] Failed to fetch pending registration:', err);
      return null;
    }
  }

  private async savePendingRegistration(email: string, data: any, ttlSeconds = 900): Promise<void> {
    try {
      const key = `reg_pending:${email.toLowerCase().trim()}`;
      await redisClient.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } catch (err) {
      console.warn('[Redis] Failed to save pending registration:', err);
    }
  }

  private async deletePendingRegistration(email: string): Promise<void> {
    try {
      const key = `reg_pending:${email.toLowerCase().trim()}`;
      await redisClient.del(key);
    } catch (err) {
      console.warn('[Redis] Failed to delete pending registration:', err);
    }
  }

  // Helper method to create user and wallet in PostgreSQL DB
  private async createUserInDatabase(pendingData: any) {
    const cleanEmail = pendingData.email.toLowerCase().trim();

    // Check DB one last time before insertion
    const existingUser = await this.userRepository.findByEmail(cleanEmail);
    if (existingUser) {
      await this.deletePendingRegistration(cleanEmail);
      throw new Error('Email is already registered in database.');
    }

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerId = `HZ-${dateStr}-${randomSuffix}`;

    const transaction = await sequelize.transaction();
    try {
      const user = await this.userRepository.create(
        {
          customerId,
          firstName: pendingData.firstName,
          lastName: pendingData.lastName,
          email: cleanEmail,
          phone: pendingData.phone,
          passwordHash: pendingData.passwordHash,
          role: 'customer',
          isVerified: true,
        },
        { transaction }
      );

      await this.walletRepository.create(
        { userId: user.id, balance: 0, currency: 'NGN', availableBalance: 0 },
        { transaction }
      );

      await transaction.commit();

      // Clear Redis cache upon successful DB insertion
      await this.deletePendingRegistration(cleanEmail);

      const token = generateToken({ id: user.id, role: user.role });
      const { passwordHash, otpCode, otpExpiry: _exp, ...safeUser } = user.toJSON() as any;
      return { user: safeUser, token, message: 'Account created successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ─── Register + OTP (Redis Cache Flow) ───────────────────────────────────
  public async registerUser(data: any) {
    const { firstName, lastName, email, phone, password } = data;
    if (!firstName || !lastName || !email || !phone) {
      throw new Error('Please provide all required fields');
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check database to prevent duplicate registration
    const existingUser = await this.userRepository.findByEmail(cleanEmail);
    if (existingUser) throw new Error('Email is already registered');

    const existingPhone = await this.userRepository.findByPhone(phone);
    if (existingPhone) throw new Error('Phone number is already registered');

    let hashedPassword = '';
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Generate 6-digit OTP code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const pendingData = {
      firstName,
      lastName,
      email: cleanEmail,
      phone,
      passwordHash: hashedPassword,
      otpCode: otp,
      otpExpiry,
      isOtpVerified: false,
      createdAt: new Date().toISOString(),
    };

    // Store in Redis Cache for 15 minutes without touching database yet
    await this.savePendingRegistration(cleanEmail, pendingData, 900);

    console.log(`[Redis Cache] Registration OTP for ${cleanEmail}: ${otp}`);

    // Send OTP email (non-blocking)
    sendEmail(cleanEmail, 'Verify your Logicore account', otpEmailTemplate(otp, firstName)).catch(
      (e) => console.error('[Email] OTP send failed:', e.message)
    );

    return {
      message: 'Registration initiated. Check your email for OTP verification code.',
      email: cleanEmail,
      otpCode: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  // ─── Verify OTP (Redis Cache -> Push to DB) ────────────────────────────────
  public async verifyOtp(userIdOrEmail: string, otp: string) {
    const cleanEmail = userIdOrEmail.toLowerCase().trim();

    // Check Redis cache first
    const pendingData = await this.getPendingRegistration(cleanEmail);

    if (pendingData) {
      if (pendingData.otpCode !== otp) throw new Error('Invalid 6-digit OTP code');
      if (Date.now() > pendingData.otpExpiry) throw new Error('OTP code has expired. Please click Resend Code.');

      pendingData.isOtpVerified = true;

      // If password is already provided, PUSH TO DATABASE NOW!
      if (pendingData.passwordHash) {
        const result = await this.createUserInDatabase(pendingData);
        return { message: 'Email verified and account created successfully', ...result };
      } else {
        // Save verified OTP state in Redis cache until password is set
        await this.savePendingRegistration(cleanEmail, pendingData, 900);
        return { message: 'Email verified successfully. Please set your password.', isOtpVerified: true, email: cleanEmail };
      }
    }

    // Fallback for pre-existing database records
    let user = await this.userRepository.findById(userIdOrEmail);
    if (!user) {
      user = await this.userRepository.findByEmail(cleanEmail);
    }
    if (!user) throw new Error('Registration session not found or expired. Please sign up again.');
    if (user.isVerified) return { message: 'Account is already verified' };
    if (!user.otpCode || user.otpCode !== otp) throw new Error('Invalid 6-digit OTP code');
    if (user.otpExpiry && new Date() > user.otpExpiry) throw new Error('OTP code has expired. Please click Resend Code.');

    (user as any).isVerified = true;
    (user as any).otpCode = null;
    (user as any).otpExpiry = null;
    await (user as any).save();

    const { passwordHash, ...safeUser } = user.toJSON() as any;
    const token = generateToken({ id: user.id, role: user.role });
    return { message: 'Email verified successfully', user: safeUser, token };
  }

  // ─── Set Password & Push to Database ──────────────────────────────────────
  public async setPasswordAndCreateUser(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const pendingData = await this.getPendingRegistration(cleanEmail);

    if (!pendingData) {
      const existingUser = await this.userRepository.findByEmail(cleanEmail);
      if (existingUser) {
        throw new Error('Account already exists. Please log in.');
      }
      throw new Error('Registration session expired or not found. Please start sign up again.');
    }

    if (!pendingData.isOtpVerified) {
      throw new Error('Please verify your OTP code before setting a password.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const salt = await bcrypt.genSalt(10);
    pendingData.passwordHash = await bcrypt.hash(password, salt);

    // NOW PUSH TO DATABASE!
    const result = await this.createUserInDatabase(pendingData);
    return { message: 'Password set and account created successfully', ...result };
  }

  // ─── Resend OTP (Redis Cache Flow) ────────────────────────────────────────
  public async resendOtp(userIdOrEmail: string) {
    const cleanEmail = userIdOrEmail.toLowerCase().trim();
    const pendingData = await this.getPendingRegistration(cleanEmail);

    if (pendingData) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

      pendingData.otpCode = otp;
      pendingData.otpExpiry = otpExpiry;

      await this.savePendingRegistration(cleanEmail, pendingData, 900);

      console.log(`[Redis OTP] Resend OTP for ${cleanEmail}: ${otp}`);

      sendEmail(cleanEmail, 'Your Logicore Verification Code', otpEmailTemplate(otp, pendingData.firstName)).catch(
        (e) => console.error('[Email] Resend OTP failed:', e.message)
      );

      return { message: 'OTP resent successfully', otpCode: otp };
    }

    // Fallback for pre-existing database records
    let user = await this.userRepository.findById(userIdOrEmail);
    if (!user) {
      user = await this.userRepository.findByEmail(cleanEmail);
    }
    if (!user) throw new Error('Registration session not found or expired. Please sign up again.');
    if (user.isVerified) throw new Error('Account is already verified');

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    (user as any).otpCode = otp;
    (user as any).otpExpiry = otpExpiry;
    await (user as any).save();

    sendEmail(user.email, 'Your Logicore Verification Code', otpEmailTemplate(otp, user.firstName)).catch(
      (e) => console.error('[Email] Resend OTP failed:', e.message)
    );

    return { message: 'OTP resent successfully', otpCode: otp };
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  public async loginUser(data: any) {
    const { email, password, deviceId, pushToken } = data;
    if (!email || !password) throw new Error('Please provide email and password');

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error('Invalid email or password');

    // Replace existing deviceId / pushToken with new deviceId provided at login
    const incomingDeviceId = deviceId || pushToken;
    if (incomingDeviceId && incomingDeviceId !== user.deviceId) {
      (user as any).deviceId = incomingDeviceId;
      (user as any).pushToken = incomingDeviceId;
      await (user as any).save();
    }

    const token = generateToken({ id: user.id, role: user.role });
    const { passwordHash, otpCode, ...safeUser } = user.toJSON() as any;

    // Inject permission rules for staff user
    try {
      const { PermissionService } = await import('./PermissionService');
      safeUser.permissions = await PermissionService.getUserPermissionsList(user.permissionGroupId);
    } catch {
      safeUser.permissions = [];
    }

    return { user: safeUser, token };
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────
  public async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('This email address is not registered in our system. Please check the email or sign up for a new account.');
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    (user as any).otpCode = otp;
    (user as any).otpExpiry = otpExpiry;
    await (user as any).save();

    console.log(`[Password Reset OTP] Code for ${email}: ${otp}`);

    sendEmail(
      email,
      'Your Hamza RMB Global Password Reset Code',
      resetPasswordEmailTemplate(otp, user.firstName)
    ).catch((e) => console.error('[Email] Reset OTP email failed:', e.message));

    return { message: 'A 6-digit OTP code has been sent to your email.' };
  }

  // ─── Verify Reset OTP ─────────────────────────────────────────────────────
  public async verifyResetOtp(email: string, otp: string) {
    const { User } = await import('../models');
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User account not found');
    if (!user.otpCode || user.otpCode !== otp) {
      throw new Error('Invalid 6-digit OTP verification code');
    }
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      throw new Error('OTP code has expired. Please click resend to get a new code.');
    }
    return { message: 'OTP verified successfully.' };
  }

  // ─── Reset Password ───────────────────────────────────────────────────────
  public async resetPassword(dataOrToken: any, newPasswordParam?: string) {
    let email = typeof dataOrToken === 'object' ? dataOrToken.email : undefined;
    let otp = typeof dataOrToken === 'object' ? dataOrToken.otp || dataOrToken.otpCode : undefined;
    let newPassword = typeof dataOrToken === 'object' ? dataOrToken.password || dataOrToken.newPassword : newPasswordParam;
    let token = typeof dataOrToken === 'string' ? dataOrToken : dataOrToken?.token;

    const { User } = await import('../models');
    let user = null;

    if (email) {
      user = await User.findOne({ where: { email } });
    } else if (token) {
      user = await User.findOne({ where: { resetToken: token } });
    }

    if (!user) throw new Error('User account not found');

    if (otp) {
      if (!user.otpCode || user.otpCode !== otp) {
        throw new Error('Invalid 6-digit OTP verification code');
      }
      if (user.otpExpiry && new Date() > user.otpExpiry) {
        throw new Error('OTP code has expired. Please click resend to get a new code.');
      }
    } else if (token) {
      if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
        throw new Error('Reset token has expired');
      }
    } else {
      throw new Error('OTP verification code is required');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const salt = await bcrypt.genSalt(10);
    (user as any).passwordHash = await bcrypt.hash(newPassword, salt);
    (user as any).otpCode = null;
    (user as any).otpExpiry = null;
    (user as any).resetToken = null;
    (user as any).resetTokenExpiry = null;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  // ─── Change Password ──────────────────────────────────────────────────────
  public async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const { User } = await import('../models');
    const user = await User.findByPk(userId);
    if (!user || !(user as any).passwordHash) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, (user as any).passwordHash);
    if (!isMatch) throw new Error('Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    (user as any).passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  // ─── Get Profile ──────────────────────────────────────────────────────────
  public async getUserProfile(userId: string) {
    const user = await this.userRepository.findById(userId, {
      attributes: { exclude: ['passwordHash', 'otpCode', 'otpExpiry', 'resetToken', 'resetTokenExpiry'] },
      include: ['wallet'],
    });
    if (!user) throw new Error('User not found');
    const safeUser = user.toJSON() as any;
    try {
      const { PermissionService } = await import('./PermissionService');
      safeUser.permissions = await PermissionService.getUserPermissionsList(user.permissionGroupId);
    } catch {
      safeUser.permissions = [];
    }
    return safeUser;
  }

  // ─── Update Profile ───────────────────────────────────────────────────────
  public async updateProfile(userId: string, data: any, photoBuffer?: Buffer) {
    const { User } = await import('../models');
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const { firstName, lastName, phone } = data;
    if (firstName) (user as any).firstName = firstName;
    if (lastName) (user as any).lastName = lastName;
    if (phone) (user as any).phone = phone;

    if (photoBuffer) {
      const photoUrl = await uploadToCloudinary(photoBuffer, 'logicore/profiles', userId);
      (user as any).profilePhoto = photoUrl;
    }

    await user.save();
    const { passwordHash, otpCode, ...safeUser } = user.toJSON() as any;
    return safeUser;
  }

  // ─── Check Availability ───────────────────────────────────────────────────
  public async checkAvailability(email?: string, phone?: string) {
    if (email) {
      const existingEmail = await this.userRepository.findByEmail(email);
      if (existingEmail) throw new Error('Email is already registered');
    }
    if (phone) {
      const existingPhone = await this.userRepository.findByPhone(phone);
      if (existingPhone) throw new Error('Phone number is already registered');
    }
    return { available: true };
  }

  public async updatePushToken(userId: string, token: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    (user as any).pushToken = token;
    (user as any).deviceId = token;
    await user.save();
    return { success: true };
  }

  // ─── One-Time Initial Super Admin Setup ──────────────────────────────────
  public async setupSuperAdmin(data: any) {
    const { User, Wallet, PermissionGroup } = await import('../models');
    
    // Check if a super admin already exists
    const existingSuperAdminCount = await User.count({ where: { role: 'super_admin' } });
    if (existingSuperAdminCount > 0) {
      throw new Error('Initialization locked: A Super Admin account already exists in the system.');
    }

    const { firstName, lastName, email, phone, password } = data;
    if (!firstName || !lastName || !email || !phone || !password) {
      throw new Error('Please provide firstName, lastName, email, phone, and password');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new Error('Email is already registered');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerId = `HZ-SADMIN-${randomSuffix}`;

    // Get Super Admin permission group if available
    const superAdminGroup = await PermissionGroup.findOne({ where: { title: 'Super Admin' } }) ||
                            await PermissionGroup.findOne({ where: { name: 'Super Admin' } });

    const user = await User.create({
      customerId,
      firstName,
      lastName,
      email,
      phone,
      passwordHash: hashedPassword,
      role: 'super_admin',
      isVerified: true,
      permissionGroupId: superAdminGroup ? superAdminGroup.id : undefined,
    });

    await Wallet.create({
      userId: user.id,
      balance: 1000000,
      currency: 'NGN',
      escrowHeld: 0,
      availableBalance: 1000000,
    });

    const token = generateToken({ id: user.id, email: user.email, role: 'super_admin', customerId });
    const { passwordHash, otpCode, ...safeUser } = user.toJSON() as any;

    return { token, user: safeUser };
  }
}
