import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporterInstance: nodemailer.Transporter | null = null;

function getTransporter() {
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : undefined;

  if (!transporterInstance && user && pass) {
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }
  return transporterInstance;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const user = process.env.SMTP_USER;
  const transporter = getTransporter();

  if (!user || !transporter) {
    console.warn('[Email] SMTP not configured – logging email payload mock.');
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Hamza RMB Global" <${user}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email Dispatched Successfully] To: ${to} | Subject: ${subject}`);
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

/**
 * Standardized Email Brand Header & Container Layout
 */
function emailLayout(title: string, bodyHtml: string) {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
      <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- Brand Header -->
        <div style="background: #0D2240; padding: 28px 24px; text-align: center; border-bottom: 3px solid #C0262D;">
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">
            HAMZA RMB <span style="color: #C0262D;">GLOBAL</span>
          </h1>
          <p style="color: #94a3b8; font-size: 11px; margin: 6px 0 0 0; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
            Bridging China & Nigeria, Connecting the World
          </p>
        </div>

        <!-- Email Content -->
        <div style="padding: 32px 24px;">
          ${bodyHtml}
        </div>

        <!-- Standard Footer -->
        <div style="background: #f1f5f9; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #475569; font-size: 12px; font-weight: 700; margin: 0;">
            Hamza RMB Global Limited
          </p>
          <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0;">
            Bridging China & Nigeria • Seamless Air & Sea Freight
          </p>
          <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0;">
            Need help? Contact support directly inside your Hamza RMB account dashboard.
          </p>
        </div>
      </div>
    </div>
  `;
}

export function otpEmailTemplate(otp: string, name: string, customHeader: string = 'Security Verification Code') {
  const content = `
    <h2 style="color: #0D2240; margin-bottom: 8px; font-size: 18px; font-weight: 700;">Hello ${name},</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      Use the 6-digit verification code below to complete your account process:
    </p>
    <div style="background: #0D2240; color: #C0262D; font-size: 36px; font-weight: 900; letter-spacing: 12px; text-align: center; padding: 20px; border-radius: 12px; margin: 24px 0; font-family: monospace;">
      ${otp}
    </div>
    <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 16px;">
      This verification code expires in 10 minutes. Do not disclose this code to anyone.
    </p>
  `;
  return emailLayout(customHeader, content);
}

export function resetPasswordEmailTemplate(otp: string, name: string) {
  return otpEmailTemplate(otp, name, 'Password Reset Code');
}

export function orderStatusEmailTemplate(params: {
  recipientName: string;
  orderType: 'Shipment' | 'Procurement' | 'Exchange' | 'Delivery';
  orderId: string;
  newStatus: string;
  statusDescription: string;
  actionUrl?: string;
}) {
  const content = `
    <p style="color: #0D2240; font-size: 15px; font-weight: 700; margin-bottom: 8px;">Hi ${params.recipientName},</p>
    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
      Your <strong>${params.orderType} order (${params.orderId})</strong> status has been updated:
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #C0262D; padding: 18px; border-radius: 8px; margin-bottom: 24px; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px;">Current Status</div>
      <div style="font-size: 18px; font-weight: 800; color: #0D2240; margin-top: 4px;">${params.newStatus.toUpperCase().replace(/_/g, ' ')}</div>
      <p style="color: #334155; font-size: 13px; margin-top: 8px; margin-bottom: 0; line-height: 1.5;">${params.statusDescription}</p>
    </div>

    ${
      params.actionUrl
        ? `<div style="text-align: center; margin: 24px 0;">
            <a href="${params.actionUrl}" style="display: inline-block; background: #0D2240; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px;">
              View Order Details ↗
            </a>
          </div>`
        : ''
    }
  `;

  return emailLayout(`${params.orderType} Status Update`, content);
}
