const express = require("express")
const userrouter = express.Router()
const {userSignup, userLogin} = require("../controller/user.controller")

userrouter.post("/signup", userSignup)
userrouter.post("/login", userLogin)

module.exports = userrouter