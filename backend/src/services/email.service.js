import nodemailer from "nodemailer";
import CompanySetting from "../models/CompanySetting.js";

/**
 * Builds transporter dynamically from CompanySetting DB or Environment variables
 */
const getTransporter = async (customConfig = null) => {
  if (customConfig && customConfig.smtpHost && customConfig.smtpUser && customConfig.smtpPass) {
    return nodemailer.createTransport({
      host: customConfig.smtpHost,
      port: parseInt(customConfig.smtpPort || "587"),
      secure: customConfig.smtpSecure === true || customConfig.smtpPort === 465,
      auth: {
        user: customConfig.smtpUser,
        pass: customConfig.smtpPass
      }
    });
  }

  // Check DB settings
  try {
    const settings = await CompanySetting.findOne();
    if (settings && settings.smtpHost && settings.smtpUser && settings.smtpPass) {
      return nodemailer.createTransport({
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort || "587"),
        secure: settings.smtpSecure === true || settings.smtpPort === 465,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass
        }
      });
    }
  } catch (e) {
    // DB lookup error fallback
  }

  // Fallback to environment variables
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return null;
};

/**
 * Core sendEmail helper
 */
export const sendEmail = async ({ to, subject, text, html, customConfig = null }) => {
  try {
    const transporter = await getTransporter(customConfig);

    if (transporter) {
      const mailOptions = {
        from: customConfig?.smtpFrom || process.env.EMAIL_FROM || '"Velora CRM" <crm@veloradesigns.com>',
        to,
        subject,
        text,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Sent to ${to}. ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      logMailFallback(to, subject, text);
      return { success: true, mode: "fallback_logged" };
    }
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error);
    logMailFallback(to, subject, text);
    return { success: false, error: error.message };
  }
};

const logMailFallback = (to, subject, text) => {
  console.log("\n========================================================");
  console.log("📨  CRM NOTIFICATION (SMTP simulation / development log):");
  console.log(`TO:      ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`DETAILS:\n${text}`);
  console.log("========================================================\n");
};

/**
 * Test SMTP Connection
 */
export const testSmtpConnection = async (smtpConfig, recipientEmail) => {
  const transporter = await getTransporter(smtpConfig);
  if (!transporter) {
    throw new Error("Invalid SMTP configuration. Please provide Host, Port, User, and Password.");
  }

  await transporter.verify();

  const mailOptions = {
    from: smtpConfig?.smtpFrom || '"Velora CRM" <crm@veloradesigns.com>',
    to: recipientEmail,
    subject: "Velora Luxury CRM - SMTP Test Email",
    text: "Your SMTP configuration is verified and functioning perfectly with Velora CRM.",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: auto; padding: 25px; border: 1px solid #e2d8c0; border-radius: 16px; background-color: #FAF9F5;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #9E7B1D; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">VELORA LUXURY SUITE</h2>
          <p style="color: #78716c; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase;">SMTP Connectivity Status</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #eee; text-align: center;">
          <h3 style="color: #15803d; margin: 0 0 10px 0;">✓ Connected Successfully</h3>
          <p style="color: #44403c; font-size: 13px; line-height: 1.6; margin: 0;">
            Your email server credentials have been validated. Velora CRM is now configured to send automated client assignment and administrative notifications.
          </p>
        </div>
        <p style="color: #a8a29e; font-size: 11px; text-align: center; margin-top: 20px;">Sent from Velora CRM System Engine</p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  return { verified: true, messageId: info.messageId };
};

/**
 * 1. Email notification to Assigned Staff (Designer / Sales) when Enquiry/Client is assigned
 */
export const sendStaffAssignmentEmail = async ({ staffEmail, staffName, clientName, clientPhone, enquiryNo, projectType, budget, assignedBy }) => {
  if (!staffEmail) return;

  const subject = `[Velora CRM] New Client Assigned: ${clientName} (${enquiryNo || "New Lead"})`;
  const text = `Hello ${staffName},\n\nYou have been assigned to handle a new client enquiry in Velora CRM:\n\nClient Name: ${clientName}\nPhone: ${clientPhone || "N/A"}\nEnquiry No: ${enquiryNo}\nProject: ${projectType || "Residential"}\nBudget: ${budget || "Standard"}\nAssigned By: ${assignedBy || "Admin"}\n\nPlease review the enquiry in your Velora CRM dashboard.`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: auto; padding: 25px; border: 1px solid #EAE3D2; border-radius: 16px; background-color: #FAF9F5;">
      <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #9E7B1D; margin: 0; font-size: 20px; font-weight: 800;">VELORA LUXURY CRM</h2>
        <span style="font-size: 11px; color: #78716c; font-weight: 600; text-transform: uppercase;">Lead & Client Assignment Notification</span>
      </div>

      <p style="color: #1c1917; font-size: 14px; font-weight: 600;">Dear ${staffName},</p>
      <p style="color: #44403c; font-size: 13px; line-height: 1.5;">You have been assigned as the primary handler for a new client in Velora CRM.</p>

      <div style="background-color: white; border: 1px solid #EAE3D2; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 12px; color: #292524; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #78716c; width: 35%;">Client Name:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #1c1917;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #78716c;">Enquiry Number:</td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #9E7B1D;">${enquiryNo || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #78716c;">Contact Phone:</td>
            <td style="padding: 6px 0; font-weight: 600;">${clientPhone || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #78716c;">Project Type:</td>
            <td style="padding: 6px 0; font-weight: 600;">${projectType || "Luxury Residential"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #78716c;">Budget Range:</td>
            <td style="padding: 6px 0; font-weight: 600;">${budget || "Standard"}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #78716c;">Assigned By:</td>
            <td style="padding: 6px 0; font-weight: 600;">${assignedBy || "Admin"}</td>
          </tr>
        </table>
      </div>

      <p style="color: #78716c; font-size: 12px; margin-top: 25px;">Please log in to your Velora CRM dashboard to view full specifications, BOQ builder, and schedule initial site consultation.</p>
    </div>
  `;

  await sendEmail({ to: staffEmail, subject, text, html });
};

/**
 * 2. Activity alert notification sent to Admin Email for critical actions
 * (User Login, Enquiry Creation, BOQ Creation/Print, Invoice Creation/Print)
 */
export const sendAdminActivityNotification = async ({ actionType, performedBy, role, clientName, details, timestamp = new Date() }) => {
  let adminEmail = "admin@veloradesign.com";
  try {
    const settings = await CompanySetting.findOne();
    if (settings?.adminNotificationEmail) {
      adminEmail = settings.adminNotificationEmail;
    }
  } catch (e) {}

  const timeStr = new Date(timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = new Date(timestamp).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });

  const subject = `[Admin Alert] ${actionType} by ${performedBy} (${role || "Staff"})`;
  const text = `Admin Notification:\n\nAction: ${actionType}\nPerformed By: ${performedBy} (${role || "Staff"})\nClient/Target: ${clientName || "General"}\nDetails: ${details || "No extra details"}\nTimestamp: ${dateStr} at ${timeStr}\n\nVelora Luxury CRM Security & Audit System.`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: auto; padding: 22px; border: 1px solid #EAE3D2; border-radius: 14px; background-color: #FAF9F5;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 16px;">
        <h3 style="color: #9E7B1D; margin: 0; font-size: 18px; font-weight: 800;">VELORA AUDIT ALERT</h3>
        <span style="font-size: 10px; background: #e7e5e4; padding: 3px 8px; border-radius: 6px; font-weight: 700; color: #44403c;">${dateStr} ${timeStr}</span>
      </div>

      <div style="background: white; border: 1px solid #EAE3D2; border-radius: 10px; padding: 16px;">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #1c1917;">${actionType}</h4>
        <div style="font-size: 12px; color: #44403c; line-height: 1.6;">
          <p style="margin: 4px 0;"><strong>Operator:</strong> ${performedBy} <span style="color: #9E7B1D; font-weight: 700;">(${role || "Staff"})</span></p>
          ${clientName ? `<p style="margin: 4px 0;"><strong>Client / Record:</strong> ${clientName}</p>` : ""}
          <p style="margin: 4px 0;"><strong>Details:</strong> ${details || "Standard CRM Execution"}</p>
        </div>
      </div>
      <p style="color: #a8a29e; font-size: 10px; text-align: center; margin-top: 16px;">Velora Luxury ERP Automated Audit Dispatch</p>
    </div>
  `;

  await sendEmail({ to: adminEmail, subject, text, html });
};

/**
 * 3. Password reset email notification
 */
export const sendPasswordResetEmail = async ({ to, resetUrl, userName = "User" }) => {
  const subject = "Password Reset Request - Velora ERP";
  const text = `Hello ${userName},\n\nYou requested a password reset for your Velora ERP account. Click the link below or copy it to your browser to set a new password:\n\n${resetUrl}\n\nIf you did not make this request, you can safely ignore this email.\n\nVelora Luxury Suite`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #EAE3D2; border-radius: 14px; background-color: #FAF9F5;">
      <h2 style="color: #9E7B1D; margin: 0 0 16px 0; font-weight: 800;">Password Reset Request</h2>
      <p style="color: #292524; font-size: 14px;">Hello <strong>${userName}</strong>,</p>
      <p style="color: #57534e; font-size: 13px;">You requested a password reset for your Velora Luxury ERP account. Click the button below to choose a new password:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #9E7B1D; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px;">Reset Password</a>
      </div>
      <p style="color: #78716c; font-size: 11px;">If you did not request this, please ignore this email or notify your system administrator.</p>
    </div>
  `;

  return await sendEmail({ to, subject, text, html });
};

/**
 * 4. Customer OTP verification email
 */
export const sendOtpEmail = async ({ to, otp, userName = "Customer" }) => {
  const subject = `Your Velora Verification Code: ${otp}`;
  const text = `Hello ${userName},\n\nYour Velora verification OTP code is: ${otp}.\n\nThis code will expire in 10 minutes.\n\nVelora Luxury Suite`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #EAE3D2; border-radius: 14px; background-color: #FAF9F5;">
      <h2 style="color: #9E7B1D; margin: 0 0 16px 0; font-weight: 800;">Verification Code</h2>
      <p style="color: #292524; font-size: 14px;">Hello <strong>${userName}</strong>,</p>
      <p style="color: #57534e; font-size: 13px;">Please use the following One-Time Password (OTP) to securely complete your authentication:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; padding: 12px 28px; background-color: #FAF6ED; border: 2px solid #D4AF37; color: #9E7B1D; font-family: monospace; font-size: 24px; font-weight: 900; letter-spacing: 6px; border-radius: 8px;">${otp}</span>
      </div>
      <p style="color: #78716c; font-size: 11px;">This code expires in 10 minutes. If you did not request this OTP, please ignore this email.</p>
    </div>
  `;

  return await sendEmail({ to, subject, text, html });
};


