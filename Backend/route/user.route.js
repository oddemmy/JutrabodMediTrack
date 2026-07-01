const express = require("express")
const userrouter = express.Router()
const {userSignup, userLogin, forgotPassword, resetPassword} = require("../controller/user.controller")
const usermodel = require("../model/user.model")
const passport = require("../services/passport")
const jwt = require("jsonwebtoken")



// Initiate Google login
userrouter.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }))

// Google callback
userrouter.get("/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/login` }),
    (req, res) => {
        try {
            if (!req.user) {
                console.error("Google OAuth callback: req.user is null")
                return res.redirect(`${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/login`)
            }
            const token = jwt.sign(
                { userId: req.user._id, email: req.user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            )
            // Redirect to frontend with token
            const redirectUrl = `${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/oauth-success?token=${token}&username=${encodeURIComponent(req.user.username)}&id=${req.user._id}&email=${encodeURIComponent(req.user.email)}`
            return res.redirect(redirectUrl)
        } catch (err) {
            console.error("Google OAuth callback error:", err)
            return res.redirect(`${process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"}/login`)
        }
    }
)

userrouter.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  console.log("Token received:", token);

  const user = await usermodel.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: Date.now() },
  });

  console.log("User found:", user);

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired verification link." });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  res.status(200).json({ message: "Email verified successfully. You can now log in." });
});

userrouter.post("/signup", userSignup)
userrouter.post("/login", userLogin)
userrouter.post("/forgot-password", forgotPassword)
userrouter.post("/reset-password", resetPassword)

module.exports = userrouter