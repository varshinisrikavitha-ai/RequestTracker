const nodemailer = require('nodemailer');

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';

const hasSmtpConfig =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_PORT &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASS;

const hasPlaceholderValues =
  process.env.SMTP_USER === 'your_email@gmail.com' ||
  process.env.SMTP_PASS === 'your_gmail_app_password';

let transporter = null;

if (EMAIL_ENABLED && hasSmtpConfig && !hasPlaceholderValues) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else if (EMAIL_ENABLED) {
  console.warn(
    'Email notifications are enabled, but SMTP credentials are not configured correctly. Update SMTP_USER and SMTP_PASS in backend .env.'
  );
}

const sendNotificationEmail = async ({ to, subject, message }) => {
  if (!EMAIL_ENABLED || !transporter || !to) return { sent: false, reason: 'Email disabled or not configured' };

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2 style="margin-bottom: 12px;">Request Tracker Notification</h2>
      <p style="margin: 0 0 12px 0;">${message}</p>
      <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 12px;">This is an automated message from Request Tracker.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: subject || 'New notification from Request Tracker',
    text: message,
    html,
  });

  return { sent: true };
};

module.exports = { sendNotificationEmail };