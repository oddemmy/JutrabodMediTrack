const express = require("express")
const medicationRouter = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { getMedications, addMedication, updateMedication, deleteMedication } = require("../controller/medication.controller")

// All routes require authentication
medicationRouter.get("/", authMiddleware, getMedications)
medicationRouter.post("/", authMiddleware, addMedication)
medicationRouter.put("/:id", authMiddleware, updateMedication)
medicationRouter.delete("/:id", authMiddleware, deleteMedication)

module.exports = medicationRouter