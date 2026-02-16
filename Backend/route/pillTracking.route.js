const express = require("express")
const pillTrackingRouter = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { getPillHistory, markAsTaken, getTodaySchedule, deleteTracking } = require("../controller/pillTracking.controller")

// All routes require authentication
pillTrackingRouter.get("/history", authMiddleware, getPillHistory)
pillTrackingRouter.get("/today", authMiddleware, getTodaySchedule)
pillTrackingRouter.post("/", authMiddleware, markAsTaken)
pillTrackingRouter.delete("/:id", authMiddleware, deleteTracking)

module.exports = pillTrackingRouter