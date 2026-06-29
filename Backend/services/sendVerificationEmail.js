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

const sendVerificationEmail = async (toEmail, token) => {
  const verificationUrl = `${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/verify-email?token=${token}`;
  const sender = process.env.EMAIL_USER || "odofinemmanuel33@gmail.com";

  try {
    await transporter.sendMail({
      from: `"Jutrabod" <${sender}>`,
      to: toEmail,
      subject: "Verify your Jutrabod account",
      html: `
        <h2>Welcome to Jutrabod!</h2>
        <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
        <a href="${verificationUrl}" style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;display:inline-block;">
          Verify Email
        </a>
        <p>If you didn't create an account, you can ignore this email.</p>
      `,
    });
    console.log("Verification email sent successfully to:", toEmail);
  } catch (error) {
    console.error("Verification email failed:", error.message);
  }
};

module.exports = sendVerificationEmail;