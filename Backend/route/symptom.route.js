const express = require("express")
const symptomRouter = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { getSymptoms, addSymptom, updateSymptom, deleteSymptom } = require("../controller/symptom.controller")

// All routes require authentication
symptomRouter.get("/", authMiddleware, getSymptoms)
symptomRouter.post("/", authMiddleware, addSymptom)
symptomRouter.put("/:id", authMiddleware, updateSymptom)
symptomRouter.delete("/:id", authMiddleware, deleteSymptom)

module.exports = symptomRouter