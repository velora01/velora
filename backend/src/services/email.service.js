import nodemailer from "nodemailer";

const getTransporter = () => {
  // Check if SMTP configuration is present in environment variables
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "2525"),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  if (transporter) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Velora CRM" <crm@veloradesigns.com>',
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`[Email Service] Failed to send email to ${to}:`, error);
      // Fallback to console log even on failure so flow is not blocked
      logMailFallback(to, subject, text);
    }
  } else {
    logMailFallback(to, subject, text);
  }
};

const logMailFallback = (to, subject, text) => {
  console.log("\n========================================================");
  console.log("📨  DEVELOPMENT MODE: Nodemailer not configured or offline");
  console.log(`TO:      ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`CONTENT:`);
  console.log(text);
  console.log("========================================================\n");
};

export const sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "Velora Customer Portal - Login OTP",
    text: `Your one-time login OTP is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
        <h2 style="color: #C9A227; margin-bottom: 20px;">Velora Customer Portal</h2>
        <p>You requested a login OTP. Please use the following code to complete your login:</p>
        <div style="background-color: #faf8f4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #999;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  await sendEmail({
    to: email,
    subject: "Velora CRM - Password Reset Request",
    text: `You requested a password reset. Please click the following link or copy it to your browser: ${resetUrl}. It is valid for 1 hour.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
        <h2 style="color: #C9A227; margin-bottom: 20px;">Velora CRM</h2>
        <p>You requested a password reset. Click the button below to update your password:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #C9A227; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 25px; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #555;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 12px; color: #C9A227; word-break: break-all;">${resetUrl}</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};
