const usermodel = require("../model/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const sendVerificationEmail = require("../services/sendVerificationEmail")
const sendResetPasswordEmail = require("../services/sendResetPasswordEmail")

const userSignup = async(req, res) => {
    try {
        const {username, email, password} = req.body
        console.log(req.body);
        
        if (!username || !email || !password ) {
            return res.status(400).json({message: "All fields are required", status: false})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newuser = await usermodel.create({
                username,
                email,
                password: hashedPassword
        })

        if (newuser) {
            const token = crypto.randomBytes(32).toString("hex")
            newuser.verificationToken = token
            newuser.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000
            await newuser.save()

            await sendVerificationEmail(newuser.email, token)

            return res.status(200).json({message: "Signup successful. Please check your email to verify your account.", status: true})
        }      
   } catch (error) {
         console.log(error);
         
        if (error.message.includes("buffering timed out")) {  
            return res.status(500).json({message: "Network error", status: false})
        }
        if (error.message.includes("E11000 duplicate key error")) {
            return res.status(400).json({message: "User already exist", status: false})
        }
        
        return res.status(500).json({message: error.message, status: false})
    }
}

const userLogin = async(req, res) => {
    console.log("Logging in...");
    console.log(req.body);
    try {
        const {email, password} = req.body
        if (!email || !password) {
            return res.status(400).json({message: "All fields are required", status: false})
        }
        const existingUser = await usermodel.findOne({email})
        if (!existingUser) {
            return res.status(400).json({message: "Invalid email or password", status: false})
        }

        if (!existingUser.isVerified) {
            return res.status(403).json({message: "Please verify your email before logging in.", status: false})
        }

        if (!existingUser.password) {
            return res.status(400).json({message: "This account uses Google Sign-In. Please login with Google.", status: false})
        }

        const hashedPassword = await bcrypt.compare(password, existingUser.password)
        if (!hashedPassword) {
            return res.status(400).json({message: "Invalid email or password", status: false})
        }
        
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email }, 
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )
        
        return res.status(200).json({
            message: "login successful", 
            status: true,
            token: token,
            user: {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message, status: false})
    }
}

const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({message: "Email is required", status: false})
        }

        const user = await usermodel.findOne({email})
        if (!user) {
            return res.status(200).json({message: "If that email exists, a reset link has been sent.", status: true})
        }

        const token = crypto.randomBytes(32).toString("hex")
        user.resetPasswordToken = token
        user.resetPasswordTokenExpiry = Date.now() + 60 * 60 * 1000
        await user.save()

        await sendResetPasswordEmail(user.email, token)

        return res.status(200).json({message: "If that email exists, a reset link has been sent.", status: true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message, status: false})
    }
}

const resetPassword = async(req, res) => {
    try {
        const { token } = req.query
        const { password } = req.body

        if (!token || !password) {
            return res.status(400).json({message: "Token and new password are required", status: false})
        }

        const user = await usermodel.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({message: "Invalid or expired reset link.", status: false})
        }

        user.password = await bcrypt.hash(password, 10)
        user.resetPasswordToken = undefined
        user.resetPasswordTokenExpiry = undefined
        await user.save()

        return res.status(200).json({message: "Password reset successful. You can now log in.", status: true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message, status: false})
    }
}

module.exports = {userSignup, userLogin, forgotPassword, resetPassword}