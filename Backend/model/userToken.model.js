const mongoose = require("mongoose")

const userTokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true
    },
    fcmToken: {
        type: String,
        required: true
    }
}, {timestamps: true})

const userTokenModel = mongoose.model("user_tokens", userTokenSchema)

module.exports = userTokenModel