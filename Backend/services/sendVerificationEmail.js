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

const sendVerificationEmail = async (toEmail, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const sender = process.env.SENDER_EMAIL || process.env.EMAIL_USER || process.env.BREVO_USER;
  await transporter.sendMail({
    from: `"Jutrabod" <${sender}>`,
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