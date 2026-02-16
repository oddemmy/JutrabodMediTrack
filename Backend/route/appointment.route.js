const express = require("express")
const appointmentRouter = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { getAppointments, addAppointment, updateAppointment, deleteAppointment } = require("../controller/appointment.controller")

// All routes require authentication
appointmentRouter.get("/", authMiddleware, getAppointments)
appointmentRouter.post("/", authMiddleware, addAppointment)
appointmentRouter.put("/:id", authMiddleware, updateAppointment)
appointmentRouter.delete("/:id", authMiddleware, deleteAppointment)

module.exports = appointmentRouter