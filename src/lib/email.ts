import { Resend } from 'resend';

// Lazy-loaded Resend client to avoid build-time errors
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - emails will not be sent');
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'PDFflow <onboarding@resend.dev>';
const APP_NAME = 'PDFflow';
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const resend = getResendClient();

    if (!resend) {
      console.log('Email skipped (no API key):', { to, subject });
      return { success: false, error: 'Email not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error };
  }
}

// Welcome email for new signups
export async function sendWelcomeEmail(email: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there';

  return sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME}!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">PDFflow</h1>
    <p style="color: #666; margin: 5px 0;">PDF Tools That Just Flow</p>
  </div>

  <h2 style="color: #333;">Hey ${firstName}! 👋</h2>

  <p>Welcome to PDFflow! We're excited to have you on board.</p>

  <p>With your free account, you can:</p>
  <ul style="color: #555;">
    <li>Process up to <strong>2 files per day</strong></li>
    <li>Access all 20+ PDF tools</li>
    <li>Work with files up to <strong>10MB</strong></li>
  </ul>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_URL}/dashboard" style="background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 500; display: inline-block;">
      Go to Dashboard
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Need more power? <a href="${APP_URL}/pricing" style="color: #6366f1;">Upgrade to Pro</a> for unlimited processing and larger files.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} PDFflow. All rights reserved.<br>
    <a href="${APP_URL}" style="color: #999;">pdfflow.com</a>
  </p>
</body>
</html>
    `,
    text: `Hey ${firstName}!\n\nWelcome to PDFflow! We're excited to have you on board.\n\nWith your free account, you can:\n- Process up to 2 files per day\n- Access all 20+ PDF tools\n- Work with files up to 10MB\n\nGo to your dashboard: ${APP_URL}/dashboard\n\nNeed more power? Upgrade to Pro for unlimited processing.\n\n© ${new Date().getFullYear()} PDFflow`,
  });
}

// Usage limit warning email
export async function sendUsageLimitEmail(email: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there';

  return sendEmail({
    to: email,
    subject: `You've reached your daily limit on ${APP_NAME}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">PDFflow</h1>
  </div>

  <h2 style="color: #333;">Hey ${firstName},</h2>

  <p>You've used all <strong>2 free file conversions</strong> for today.</p>

  <p>Your limit will reset at midnight, or you can upgrade to Pro for:</p>
  <ul style="color: #555;">
    <li><strong>Unlimited</strong> file processing</li>
    <li>Files up to <strong>100MB</strong></li>
    <li>Priority processing speed</li>
    <li>Batch processing</li>
  </ul>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_URL}/pricing" style="background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 500; display: inline-block;">
      Upgrade to Pro
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} PDFflow. All rights reserved.
  </p>
</body>
</html>
    `,
  });
}

// Pro subscription confirmation
export async function sendProWelcomeEmail(email: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there';

  return sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME} Pro! 🎉`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">PDFflow <span style="background: linear-gradient(to right, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Pro</span></h1>
  </div>

  <h2 style="color: #333;">Hey ${firstName}! 🎉</h2>

  <p>Thank you for upgrading to PDFflow Pro! Your account has been upgraded and you now have access to:</p>

  <ul style="color: #555;">
    <li>✅ <strong>Unlimited</strong> file processing</li>
    <li>✅ Files up to <strong>100MB</strong></li>
    <li>✅ Priority processing speed</li>
    <li>✅ Batch processing</li>
    <li>✅ Advanced tools (OCR, native exports)</li>
  </ul>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_URL}/dashboard" style="background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 500; display: inline-block;">
      Start Using Pro Features
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Questions? Reply to this email and we'll help you out.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} PDFflow. All rights reserved.
  </p>
</body>
</html>
    `,
  });
}

// Subscription cancellation email
export async function sendCancellationEmail(email: string, name?: string, endDate?: string) {
  const firstName = name?.split(' ')[0] || 'there';
  const formattedDate = endDate ? new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'the end of your billing period';

  return sendEmail({
    to: email,
    subject: `Your ${APP_NAME} Pro subscription has been cancelled`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">PDFflow</h1>
  </div>

  <h2 style="color: #333;">Hey ${firstName},</h2>

  <p>We're sorry to see you go! Your PDFflow Pro subscription has been cancelled.</p>

  <p>You'll continue to have Pro access until <strong>${formattedDate}</strong>. After that, your account will revert to the free plan.</p>

  <p style="color: #666;">Changed your mind? You can resubscribe anytime:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_URL}/pricing" style="background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 500; display: inline-block;">
      Resubscribe to Pro
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    We'd love to hear your feedback. Reply to this email to let us know how we can improve.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} PDFflow. All rights reserved.
  </p>
</body>
</html>
    `,
  });
}

// Password reset success email (optional, Supabase handles reset link)
export async function sendPasswordChangedEmail(email: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there';

  return sendEmail({
    to: email,
    subject: `Your ${APP_NAME} password has been changed`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #6366f1; margin: 0;">PDFflow</h1>
  </div>

  <h2 style="color: #333;">Hey ${firstName},</h2>

  <p>Your password has been successfully changed.</p>

  <p style="color: #666;">If you didn't make this change, please contact us immediately by replying to this email.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${APP_URL}/login" style="background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 500; display: inline-block;">
      Sign In
    </a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    © ${new Date().getFullYear()} PDFflow. All rights reserved.
  </p>
</body>
</html>
    `,
  });
}
