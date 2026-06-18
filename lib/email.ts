import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Skip if email is not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email not configured, skipping...');
      return false;
    }

    const transporter = createTransporter();

    // Send mail
    const info = await transporter.sendMail({
      from: `"Translation Admin" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function generateTranslationUpdateEmail(
  locale: string,
  changedBy: string,
  changes: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .info-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #9333ea;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #6b7280;
          }
          .value {
            color: #111827;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌐 Translation Update Notification</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>A translation file has been updated in your portfolio admin panel.</p>

            <div class="info-box">
              <div class="info-row">
                <span class="label">Language:</span>
                <span class="value">${locale.toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="label">Updated By:</span>
                <span class="value">${changedBy}</span>
              </div>
              <div class="info-row">
                <span class="label">Total Translations:</span>
                <span class="value">${changes}</span>
              </div>
              <div class="info-row">
                <span class="label">Timestamp:</span>
                <span class="value">${new Date().toLocaleString()}</span>
              </div>
            </div>

            <p>The changes have been saved successfully to <code>${locale}.json</code></p>

            <p style="margin-top: 30px;">
              <a href="http://localhost:3000/${locale}"
                 style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 8px;
                        display: inline-block;">
                View Live Site
              </a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from your Translation Admin Panel</p>
            <p style="font-size: 12px; color: #9ca3af;">
              Generated with Claude Code
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
