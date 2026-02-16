const express = require("express")
const userTokenRouter = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { saveUserToken } = require("../controller/userToken.controller")

// Save FCM token (requires authentication)
userTokenRouter.post("/", authMiddleware, saveUserToken)

module.exports = userTokenRouter