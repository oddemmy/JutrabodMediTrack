const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Jutrabod" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your Jutrabod password",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your Jutrabod password. Click the link below to set a new password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="padding:10px 20px;background:#2196F3;color:white;text-decoration:none;border-radius:5px;">
        Reset Password
      </a>
      <p>If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.</p>
    `,
  });
};

module.exports = sendResetPasswordEmail;