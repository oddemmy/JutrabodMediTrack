const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "odofinemmanuel33@gmail.com",
    pass: process.env.EMAIL_PASS || "hsmkftwalkgopcqw",
  },
});

const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const sender = process.env.SENDER_EMAIL || process.env.EMAIL_USER || process.env.BREVO_USER || "odofinemmanuel33@gmail.com";
  await transporter.sendMail({
    from: `"Jutrabod" <${sender}>`,
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