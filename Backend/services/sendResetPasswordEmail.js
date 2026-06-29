const axios = require("axios");

const sendResetPasswordEmail = async (toEmail, token) => {
  const resetUrl = `${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/reset-password?token=${token}`;
  const apiKey = process.env.RESEND_API_KEY || "re_MUYq4R4D_Ms4tkboinEkSXwKS7vWZPCBa";

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Jutrabod <onboarding@resend.dev>",
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
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Reset email sent via Resend:", response.data);
  } catch (error) {
    console.error("Resend reset email failed:", error.response ? error.response.data : error.message);
  }
};

module.exports = sendResetPasswordEmail;