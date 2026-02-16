const appointmentModel = require("../model/appointment.model")

// Get all appointments for a user
const getAppointments = async (req, res) => {
    try {
        const userId = req.userId
        const { status } = req.query // Optional filter by status
        
        const filter = { userId }
        if (status) {
            filter.status = status
        }
        
        const appointments = await appointmentModel.find(filter).sort({ appointmentDate: 1 })
        return res.status(200).json({ appointments, status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Add new appointment
const addAppointment = async (req, res) => {
    try {
        const userId = req.userId
        const { doctorName, specialty, appointmentDate, location, reason, notes, status, familyMemberId } = req.body  // ADD familyMemberId

        if (!doctorName || !appointmentDate) {
            return res.status(400).json({ message: "Doctor name and date are required", status: false })
        }

        const newAppointment = await appointmentModel.create({
            userId,
            familyMemberId,  // ADD THIS
            doctorName,
            specialty,
            appointmentDate,
            location,
            reason,
            notes,
            status: status || 'upcoming'
        })

        return res.status(201).json({ appointment: newAppointment, message: "Appointment added", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Update appointment
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const updates = req.body

        const appointment = await appointmentModel.findOne({ _id: id, userId })
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found", status: false })
        }

        const updatedAppointment = await appointmentModel.findByIdAndUpdate(id, updates, { new: true })
        return res.status(200).json({ appointment: updatedAppointment, message: "Appointment updated", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Delete appointment
const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const appointment = await appointmentModel.findOne({ _id: id, userId })
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found", status: false })
        }

        await appointmentModel.findByIdAndDelete(id)
        return res.status(200).json({ message: "Appointment deleted", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

module.exports = { getAppointments, addAppointment, updateAppointment, deleteAppointment }