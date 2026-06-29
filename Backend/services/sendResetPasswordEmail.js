const axios = require("axios");

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/reset-password?token=${token}`;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Jutrabod", email: "odofinemmanuel33@gmail.com" },
        to: [{ email: toEmail }],
        subject: "Reset your Jutrabod password",
        htmlContent: `
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password. This link expires in 24 hours.</p>
          <a href="${resetUrl}" style="padding:10px 20px;background:#008CBA;color:white;text-decoration:none;border-radius:5px;display:inline-block;">
            Reset Password
          </a>
          <p>If you didn't request a password reset, you can ignore this email.</p>
        `,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );
    console.log("Reset email sent via Brevo API to:", toEmail, response.data);
  } catch (error) {
    console.error("Brevo reset email failed:", error.response ? error.response.data : error.message);
  }
};

module.exports = sendResetPasswordEmail;