const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const usermodel = require("../model/user.model")

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || "https://jutrabodmeditrack.onrender.com"}/user/auth/google/callback`,
    proxy: true,
    state: false
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const googleEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null
        const googleId = profile.id
        const displayName = profile.displayName || "Google User"

        console.log("Google OAuth: authenticating", googleEmail, googleId)

        if (!googleEmail) {
            return done(new Error("No email returned from Google"), null)
        }

        // Check if user already exists by googleId
        let user = await usermodel.findOne({ googleId })
        if (user) {
            console.log("Google OAuth: existing Google user found:", user.email)
            return done(null, user)
        }

        // Check if email already exists (signed up manually before) — link it
        user = await usermodel.findOneAndUpdate(
            { email: googleEmail },
            { $set: { googleId, isVerified: true } },
            { new: true }
        )
        if (user) {
            console.log("Google OAuth: linked existing email account:", user.email)
            return done(null, user)
        }

        // Create new user
        const newUser = await usermodel.create({
            username: displayName,
            email: googleEmail,
            googleId,
            isVerified: true,
        })
        console.log("Google OAuth: new user created:", newUser.email)
        return done(null, newUser)
    } catch (error) {
        console.error("Google OAuth strategy error:", error)
        return done(error, null)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    const user = await usermodel.findById(id)
    done(null, user)
})

module.exports = passport