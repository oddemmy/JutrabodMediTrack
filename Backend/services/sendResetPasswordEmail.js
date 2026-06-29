const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "odofinemmanuel33@gmail.com",
    pass: process.env.EMAIL_PASS || "hsmkftwalkgopcqw",
  },
});

const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/reset-password?token=${token}`;
  const sender = process.env.EMAIL_USER || "odofinemmanuel33@gmail.com";

  try {
    await transporter.sendMail({
      from: `"Jutrabod" <${sender}>`,
      to: toEmail,
      subject: "Reset your Jutrabod password",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password. This link expires in 24 hours.</p>
        <a href="${resetUrl}" style="padding:10px 20px;background:#008CBA;color:white;text-decoration:none;border-radius:5px;display:inline-block;">
          Reset Password
        </a>
        <p>If you didn't request a password reset, you can ignore this email.</p>
      `,
    });
    console.log("Reset password email sent successfully to:", toEmail);
  } catch (error) {
    console.error("Reset password email failed:", error.message);
  }
};

module.exports = sendResetPasswordEmail;