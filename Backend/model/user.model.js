const mongoose = require("mongoose")

// schema for users
const userschema = mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
})

const usermodel = mongoose.model("user_collections", userschema)

module.exports = usermodel 