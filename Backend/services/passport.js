const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const usermodel = require("../model/user.model")

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || "https://jutrabodmeditrack.onrender.com"}/user/auth/google/callback`,
    proxy: true
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await usermodel.findOne({ googleId: profile.id })

        if (user) {
            return done(null, user)
        }

        // Check if email already exists (signed up manually before)
        user = await usermodel.findOne({ email: profile.emails[0].value })

        if (user) {
            // Link google account to existing user
            user.googleId = profile.id
            user.isVerified = true
            await user.save()
            return done(null, user)
        }

        // Create new user
        const newUser = await usermodel.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            isVerified: true,
        })

        return done(null, newUser)
    } catch (error) {
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