const express = require("express")
const healthMetricRouter = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { getHealthMetrics, addHealthMetric, deleteHealthMetric } = require("../controller/healthMetric.controller")

// All routes require authentication
healthMetricRouter.get("/", authMiddleware, getHealthMetrics)
healthMetricRouter.post("/", authMiddleware, addHealthMetric)
healthMetricRouter.delete("/:id", authMiddleware, deleteHealthMetric)

module.exports = healthMetricRouter