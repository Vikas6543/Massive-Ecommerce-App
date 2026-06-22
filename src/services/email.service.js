import transporter from "../config/email.js";

// ✅ Base send email function
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Massive Shop" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// ✅ Send Email Verification Link
export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify Your Email - Massive Shop",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hello ${name}! 👋</h2>
        <p>Thank you for registering. Please verify your email by clicking below:</p>
        <a href="${verifyUrl}"
          style="background: #4F46E5; color: white; padding: 12px 24px;
          text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email
        </a>
        <p style="margin-top: 16px; color: #666;">This link expires in <b>24 hours</b>.</p>
      </div>
    `,
  });
};

// ✅ Send OTP Email
export const sendOTPEmail = async (email, name, otp, purpose) => {
  const purposeText = {
    "email-verification": "verify your email",
    "password-reset": "reset your password",
    login: "login to your account",
  };

  await sendEmail({
    to: email,
    subject: "Your OTP - Massive Shop",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hello ${name}! 👋</h2>
        <p>Your OTP to <b>${purposeText[purpose]}</b> is:</p>
        <div style="font-size: 36px; font-weight: bold; color: #4F46E5;
          letter-spacing: 8px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #666;">This OTP expires in <b>10 minutes</b>.</p>
      </div>
    `,
  });
};

// ✅ Send Password Reset Email
export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset Your Password - Massive Shop",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hello ${name}! 👋</h2>
        <p>You requested to reset your password. Click below:</p>
        <a href="${resetUrl}"
          style="background: #DC2626; color: white; padding: 12px 24px;
          text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
        <p style="margin-top: 16px; color: #666;">This link expires in <b>1 hour</b>.</p>
      </div>
    `,
  });
};

// ✅ Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: "Welcome to Massive Shop! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${name}! 🎉</h2>
        <p>Your account has been verified successfully.</p>
        <p>Start shopping now and enjoy exclusive deals!</p>
        <a href="${process.env.CLIENT_URL}"
          style="background: #4F46E5; color: white; padding: 12px 24px;
          text-decoration: none; border-radius: 6px; display: inline-block;">
          Start Shopping
        </a>
      </div>
    `,
  });
};

// ✅ Send New Device Login Alert
export const sendNewDeviceEmail = async (
  email,
  name,
  deviceInfo,
  ipAddress,
) => {
  await sendEmail({
    to: email,
    subject: "⚠️ New Device Login - Massive Shop",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">New Device Login Detected! ⚠️</h2>
        <p>Hello ${name},</p>
        <p>We detected a login to your account from a new device:</p>
        <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><b>Browser:</b> ${deviceInfo.browser}</p>
          <p><b>OS:</b> ${deviceInfo.os}</p>
          <p><b>Platform:</b> ${deviceInfo.platform}</p>
          <p><b>IP Address:</b> ${ipAddress}</p>
          <p><b>Time:</b> ${new Date().toLocaleString()}</p>
        </div>
        <p>If this was you, no action needed.</p>
        <p style="color: #DC2626;">
          If this wasn't you, please 
          <a href="${process.env.CLIENT_URL}/reset-password">reset your password</a> 
          immediately!
        </p>
      </div>
    `,
  });
};

// ✅ Send Account Locked Email
export const sendAccountLockedEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: "🔒 Account Locked - Massive Shop",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Account Temporarily Locked 🔒</h2>
        <p>Hello ${name},</p>
        <p>Your account has been temporarily locked due to 
           <b>5 consecutive failed login attempts</b>.</p>
        <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p>🕐 Your account will be unlocked after <b>30 minutes</b>.</p>
        </div>
        <p>If this wasn't you, please reset your password immediately:</p>
        <a href="${process.env.CLIENT_URL}/forgot-password"
          style="background: #DC2626; color: white; padding: 12px 24px;
          text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
    `,
  });
};
