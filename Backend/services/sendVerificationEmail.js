const axios = require("axios");

const sendVerificationEmail = async (toEmail, token) => {
  const verificationUrl = `${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/verify-email?token=${token}`;
  const apiKey = process.env.RESEND_API_KEY || "re_MUYq4R4D_Ms4tkboinEkSXwKS7vWZPCBa";

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Jutrabod <onboarding@resend.dev>",
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
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Verification email sent via Resend:", response.data);
  } catch (error) {
    console.error("Resend verification email failed:", error.response ? error.response.data : error.message);
  }
};

module.exports = sendVerificationEmail;