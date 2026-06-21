const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Jutrabod" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your Jutrabod account",
    html: `
      <h2>Welcome to Jutrabod!</h2>
      <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
      <a href="${verificationUrl}" style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
        Verify Email
      </a>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });
};

module.exports = sendVerificationEmail;