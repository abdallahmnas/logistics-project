import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { sequelize, User, Wallet, PermissionGroup } from '../models/index';
import { SeedPermissionService } from '../services/SeedPermissionService';

dotenv.config();

async function createSuperAdminCLI() {
  const args = process.argv.slice(2);
  const getArg = (name: string): string | undefined => {
    const match = args.find((a) => a.startsWith(`--${name}=`));
    return match ? match.split('=')[1] : undefined;
  };

  const email = getArg('email') || process.env.SUPER_ADMIN_EMAIL;
  const password = getArg('password') || process.env.SUPER_ADMIN_PASSWORD;
  const firstName = getArg('firstName') || 'Super';
  const lastName = getArg('lastName') || 'Admin';
  const phone = getArg('phone') || '+2348000000000';

  if (!email || !password) {
    console.error(`
❌ Error: Missing required credentials.

Usage via command line arguments:
  npx tsx server/src/scripts/createSuperAdmin.ts --email="admin@company.com" --password="YourSecurePassword123!" --firstName="Main" --lastName="Admin" --phone="+2348012345678"

Or via environment variables in .env:
  SUPER_ADMIN_EMAIL=admin@company.com
  SUPER_ADMIN_PASSWORD=YourSecurePassword123!
`);
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // Ensure permission groups exist
    await SeedPermissionService.seedDefaultGroups();

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      if (existingUser.role === 'super_admin') {
        console.log(`⚠️ User with email "${email}" is ALREADY a Super Admin.`);
        process.exit(0);
      }
      console.log(`🔄 Upgrading existing user "${email}" to Super Admin...`);
      const group = await PermissionGroup.findOne({ where: { title: 'Super Admin' } }) ||
                    await PermissionGroup.findOne({ where: { name: 'Super Admin' } });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      existingUser.role = 'super_admin';
      existingUser.passwordHash = hashedPassword;
      if (group) existingUser.permissionGroupId = group.id;
      await existingUser.save();
      console.log(`🎉 User "${email}" successfully upgraded to Super Admin!`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerId = `HZ-SADMIN-${randomSuffix}`;

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

    console.log(`
=====================================================
🎉 SUPER ADMIN ACCOUNT CREATED SUCCESSFULLY!
-----------------------------------------------------
  Name:        ${firstName} ${lastName}
  Email:       ${email}
  Customer ID: ${customerId}
  Role:        super_admin
=====================================================
`);
  } catch (error: any) {
    console.error('❌ Failed to create Super Admin:', error.message || error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createSuperAdminCLI();
