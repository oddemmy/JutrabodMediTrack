const express = require("express")
const drugInteractionRouter = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { checkInteractions } = require("../controller/drugInteraction.controller")

// Check drug interactions (requires authentication)
drugInteractionRouter.get("/check", authMiddleware, checkInteractions)

module.exports = drugInteractionRouter