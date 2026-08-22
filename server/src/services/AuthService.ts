import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sequelize } from '../models';
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { generateToken } from '../config/jwt';
import { sendEmail, otpEmailTemplate, resetPasswordEmailTemplate } from '../config/email';
import { uploadToCloudinary } from '../config/cloudinary';

export class AuthService {
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.walletRepository = new WalletRepository();
  }

  // ─── Register + OTP ───────────────────────────────────────────────────────
  public async registerUser(data: any) {
    const { firstName, lastName, email, phone, password } = data;
    if (!firstName || !lastName || !email || !phone || !password) {
      throw new Error('Please provide all required fields');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new Error('Email is already registered');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerId = `HZ-${dateStr}-${randomSuffix}`;

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`[OTP] Registration OTP for ${email}: ${otp}`);

    const transaction = await sequelize.transaction();
    try {
      const user = await this.userRepository.create(
        {
          customerId,
          firstName,
          lastName,
          email,
          phone,
          passwordHash: hashedPassword,
          role: 'customer',
          isVerified: false,
          otpCode: otp,
          otpExpiry,
        },
        { transaction }
      );

      await this.walletRepository.create(
        { userId: user.id, balance: 0, currency: 'NGN', availableBalance: 0 },
        { transaction }
      );

      await transaction.commit();

      // Send OTP email (non-blocking)
      sendEmail(email, 'Verify your Logicore account', otpEmailTemplate(otp, firstName)).catch(
        (e) => console.error('[Email] OTP send failed:', e.message)
      );

      const token = generateToken({ id: user.id, role: user.role });
      const { passwordHash, otpCode, otpExpiry: _exp, ...safeUser } = user.toJSON() as any;
      return { user: safeUser, token };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ─── Verify OTP ───────────────────────────────────────────────────────────
  public async verifyOtp(userIdOrEmail: string, otp: string) {
    let user = await this.userRepository.findById(userIdOrEmail);
    if (!user) {
      user = await this.userRepository.findByEmail(userIdOrEmail);
    }
    if (!user) throw new Error('User account not found');
    if (user.isVerified) return { message: 'Account is already verified' };
    if (!user.otpCode || user.otpCode !== otp) throw new Error('Invalid 6-digit OTP code');
    if (user.otpExpiry && new Date() > user.otpExpiry) throw new Error('OTP code has expired. Please click Resend Code.');

    (user as any).isVerified = true;
    (user as any).otpCode = null;
    (user as any).otpExpiry = null;
    await (user as any).save();

    const { passwordHash, ...safeUser } = user.toJSON() as any;
    return { message: 'Email verified successfully', user: safeUser };
  }

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  public async resendOtp(userIdOrEmail: string) {
    let user = await this.userRepository.findById(userIdOrEmail);
    if (!user) {
      user = await this.userRepository.findByEmail(userIdOrEmail);
    }
    if (!user) throw new Error('User account not found');
    if (user.isVerified) throw new Error('Account is already verified');

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`[OTP] Resend OTP for ${user.email}: ${otp}`);

    (user as any).otpCode = otp;
    (user as any).otpExpiry = otpExpiry;
    await (user as any).save();

    sendEmail(user.email, 'Your HAMZA RMB GLOBAL Verification Code', otpEmailTemplate(otp, user.firstName)).catch(
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
    return { user: safeUser, token };
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────
  public async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If that email exists, a reset link has been sent' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    (user as any).resetToken = resetToken;
    (user as any).resetTokenExpiry = resetTokenExpiry;
    await (user as any).save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    console.log(`[Password Reset] Token for ${email}: ${resetToken}`);

    sendEmail(
      email,
      'Reset your Logicore password',
      resetPasswordEmailTemplate(resetUrl, user.firstName)
    ).catch((e) => console.error('[Email] Reset email failed:', e.message));

    return { message: 'If that email exists, a reset link has been sent' };
  }

  // ─── Reset Password ───────────────────────────────────────────────────────
  public async resetPassword(token: string, newPassword: string) {
    const { User } = await import('../models');
    const user = await User.findOne({ where: { resetToken: token } });
    if (!user) throw new Error('Invalid or expired reset token');
    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      throw new Error('Reset token has expired');
    }

    const salt = await bcrypt.genSalt(10);
    (user as any).passwordHash = await bcrypt.hash(newPassword, salt);
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
    return user;
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
}
