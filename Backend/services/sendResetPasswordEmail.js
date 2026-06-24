const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Jutrabod" <${process.env.BREVO_USER}>`,
    to: toEmail,
    subject: "Reset your Jutrabod password",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your Jutrabod password. Click the link below to set a new password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="padding:10px 20px;background:#2196F3;color:white;text-decoration:none;border-radius:5px;">
        Reset Password
      </a>
      <p>If you didn't request a password reset, you can ignore this email.</p>
    `,
  });
};

module.exports = sendResetPasswordEmail;