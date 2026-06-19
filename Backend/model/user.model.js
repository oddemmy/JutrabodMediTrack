const mongoose = require("mongoose")

const userschema = mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String},
    googleId: {type: String},
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {type: String},
    verificationTokenExpiry: {type: Date},
    resetPasswordToken: {type: String},
    resetPasswordTokenExpiry: {type: Date},
})
const usermodel = mongoose.model("user_collections", userschema)

module.exports = usermodel