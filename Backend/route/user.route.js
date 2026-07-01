const express = require("express")
const userrouter = express.Router()
const {userSignup, userLogin, forgotPassword, resetPassword} = require("../controller/user.controller")
const usermodel = require("../model/user.model")
const jwt = require("jsonwebtoken")
const axios = require("axios")

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const BACKEND_URL = process.env.BACKEND_URL || "https://jutrabodmeditrack.onrender.com"
const CLIENT_URL = process.env.CLIENT_URL || "https://jutrabod-frontend.onrender.com"
const CALLBACK_URL = `${BACKEND_URL}/user/auth/google/callback`


// Initiate Google login — redirect user to Google consent screen
userrouter.get("/auth/google", (req, res) => {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: CALLBACK_URL,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "select_account",
    })
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    console.log("Google OAuth: redirecting to Google:", googleAuthUrl)
    return res.redirect(googleAuthUrl)
})

// Google callback — exchange code for token, get profile, find/create user
userrouter.get("/auth/google/callback", async (req, res) => {
    try {
        const { code, error } = req.query

        if (error) {
            console.error("Google OAuth denied:", error)
            return res.redirect(`${CLIENT_URL}/login`)
        }

        if (!code) {
            console.error("Google OAuth callback: no code received")
            return res.redirect(`${CLIENT_URL}/login`)
        }

        // Step 1: Exchange authorization code for access token
        console.log("Google OAuth: exchanging code for token...")
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: CALLBACK_URL,
            grant_type: "authorization_code",
        })

        const { access_token } = tokenResponse.data

        // Step 2: Get user profile from Google
        console.log("Google OAuth: fetching user profile...")
        const profileResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` }
        })

        const { sub: googleId, email, name: displayName } = profileResponse.data
        console.log("Google OAuth: profile received:", email, googleId)

        if (!email) {
            console.error("Google OAuth: no email in profile")
            return res.redirect(`${CLIENT_URL}/login`)
        }

        // Step 3: Find user by googleId, or link to existing email, or create new
        let user = await usermodel.findOne({ googleId })
        if (!user) {
            user = await usermodel.findOneAndUpdate(
                { email },
                { $set: { googleId, isVerified: true } },
                { new: true }
            )
        }
        if (!user) {
            user = await usermodel.create({
                username: displayName || "Google User",
                email,
                googleId,
                isVerified: true,
            })
            console.log("Google OAuth: new user created:", email)
        } else {
            console.log("Google OAuth: existing user found/linked:", email)
        }

        // Step 4: Generate JWT and redirect to frontend
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        const redirectUrl = `${CLIENT_URL}/oauth-success?token=${token}&username=${encodeURIComponent(user.username)}&id=${user._id}&email=${encodeURIComponent(user.email)}`
        console.log("Google OAuth: login successful, redirecting to frontend")
        return res.redirect(redirectUrl)

    } catch (err) {
        const errMsg = err.response?.data?.error_description || err.response?.data?.error || err.message || "unknown_error"
        console.error("Google OAuth callback error:", errMsg, err.response?.data)
        return res.redirect(`${CLIENT_URL}/login?oauth_error=${encodeURIComponent(errMsg)}`)
    }
})

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