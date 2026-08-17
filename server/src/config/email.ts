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
    console.warn('[Email] SMTP not configured – logging email payload.');
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Logicore RMB" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (e: any) {
    console.error('[Email] Failed to send email to', to, 'Error:', e.message);
  }
}

export async function sendPushNotification(payload: {
  pushToken?: string;
  title: string;
  message: string;
  data?: object;
}) {
  if (!payload.pushToken) {
    console.log(`[Push Notification Mock] Title: "${payload.title}" | Body: "${payload.message}" (No token registered)`);
    return;
  }

  console.log(`[Push Notification Dispatched] Token: ${payload.pushToken} | Title: "${payload.title}" | Body: "${payload.message}"`);
  
  // Expo Push API / FCM Integration
  if (payload.pushToken.startsWith('ExponentPushToken[')) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payload.pushToken,
          title: payload.title,
          body: payload.message,
          data: payload.data || {},
        }),
      });
    } catch (err: any) {
      console.error('[Push Notification] FCM/Expo push failed:', err.message);
    }
  }
}

export function otpEmailTemplate(otp: string, name: string) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0A1128; font-size: 24px; font-weight: 800; margin: 0;">LOGICORE <span style="color: #E8590C;">RMB</span></h1>
      </div>
      <h2 style="color: #0A1128; margin-bottom: 8px; font-size: 18px;">Verify Your Email Address</h2>
      <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Hi ${name}, use the 6-digit code below to complete your Logicore account verification:</p>
      <div style="background: #0A1128; color: #E8590C; font-size: 36px; font-weight: bold; letter-spacing: 10px; text-align: center; padding: 20px; border-radius: 12px; margin: 24px 0;">
        ${otp}
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
}

export function resetPasswordEmailTemplate(resetUrl: string, name: string) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0A1128; font-size: 24px; font-weight: 800; margin: 0;">LOGICORE <span style="color: #E8590C;">RMB</span></h1>
      </div>
      <h2 style="color: #0A1128; margin-bottom: 8px; font-size: 18px;">Reset Your Password</h2>
      <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Hi ${name}, click the button below to reset your Logicore account password. This link expires in 1 hour.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #E8590C; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
          Reset Password →
        </a>
      </div>
    </div>
  `;
}

export function orderStatusEmailTemplate(params: {
  recipientName: string;
  orderType: 'Shipment' | 'Procurement' | 'Exchange' | 'Delivery';
  orderId: string;
  newStatus: string;
  statusDescription: string;
  actionUrl?: string;
}) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px; border-b: 1px solid #f1f5f9; pb-16px;">
        <h1 style="color: #0A1128; font-size: 24px; font-weight: 800; margin: 0;">LOGICORE <span style="color: #E8590C;">RMB</span></h1>
        <p style="color: #64748b; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">${params.orderType} Status Update</p>
      </div>

      <p style="color: #0A1128; font-size: 15px; font-weight: 600; margin-bottom: 12px;">Hi ${params.recipientName},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Your <strong>${params.orderType} (${params.orderId})</strong> status has been updated:
      </p>

      <div style="background: #f8fafc; border-left: 4px solid #E8590C; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">New Status</div>
        <div style="font-size: 18px; font-weight: 800; color: #0A1128; margin-top: 2px;">${params.newStatus.toUpperCase().replace(/_/g, ' ')}</div>
        <p style="color: #475569; font-size: 13px; margin-top: 8px; margin-bottom: 0;">${params.statusDescription}</p>
      </div>

      ${
        params.actionUrl
          ? `<div style="text-align: center; margin: 24px 0;">
              <a href="${params.actionUrl}" style="display: inline-block; background: #0A1128; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
                View Order Details ↗
              </a>
            </div>`
          : ''
      }

      <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        Need assistance? Contact our 24/7 support team via your Logicore portal.
      </p>
    </div>
  `;
}
