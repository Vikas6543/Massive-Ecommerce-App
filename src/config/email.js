import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
  } catch (error) {
    console.error("❌ Email service error:", error.message);
  }
};

export default transporter;
