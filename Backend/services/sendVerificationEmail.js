const axios = require("axios");

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const sendVerificationEmail = async (toEmail, token) => {
  const verificationUrl = `${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/verify-email?token=${token}`;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Jutrabod", email: "odofinemmanuel33@gmail.com" },
        to: [{ email: toEmail }],
        subject: "Verify your Jutrabod account",
        htmlContent: `
          <h2>Welcome to Jutrabod!</h2>
          <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
          <a href="${verificationUrl}" style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;display:inline-block;">
            Verify Email
          </a>
          <p>If you didn't create an account, you can ignore this email.</p>
        `,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );
    console.log("Verification email sent via Brevo API to:", toEmail, response.data);
  } catch (error) {
    console.error("Brevo verification email failed:", error.response ? error.response.data : error.message);
  }
};

module.exports = sendVerificationEmail;