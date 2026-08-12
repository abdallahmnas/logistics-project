import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP not configured – skipping send. To:', to, 'Subject:', subject);
    return;
  }
  await transporter.sendMail({
    from: `"Logicore RMB" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export function otpEmailTemplate(otp: string, name: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
      <h2 style="color: #1e3a5f; margin-bottom: 8px;">Verify your email</h2>
      <p style="color: #64748b;">Hi ${name}, use the code below to complete your registration:</p>
      <div style="background: #1e3a5f; color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 12px; text-align: center; padding: 24px; border-radius: 8px; margin: 24px 0;">
        ${otp}
      </div>
      <p style="color: #94a3b8; font-size: 13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
}

export function resetPasswordEmailTemplate(resetUrl: string, name: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
      <h2 style="color: #1e3a5f; margin-bottom: 8px;">Reset your password</h2>
      <p style="color: #64748b;">Hi ${name}, click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #1e3a5f; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #94a3b8; font-size: 13px;">If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
}
