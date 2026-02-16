const medicationModel = require("../model/medication.model")

// Get all medications for a user
const getMedications = async (req, res) => {
    try {
        const userId = req.userId // Will come from auth middleware
        const medications = await medicationModel.find({ userId })
        return res.status(200).json({ medications, status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Add new medication
const addMedication = async (req, res) => {
    try {
        const userId = req.userId
        const { medicationName, dosage, frequency, times, instructions, startDate, endDate, isActive, quantityTotal, quantityRemaining, lowStockThreshold, familyMemberId } = req.body

        if (!medicationName || !dosage || !frequency) {
            return res.status(400).json({ message: "Required fields missing", status: false })
        }

        const newMedication = await medicationModel.create({
            userId,
            familyMemberId,  // ADD THIS LINE if it's missing
            medicationName,
            dosage,
            frequency,
            times,
            instructions,
            startDate,
            endDate,
            isActive,
            quantityTotal,
            quantityRemaining,
            lowStockThreshold
        })

        return res.status(201).json({ medication: newMedication, message: "Medication added", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Update medication
const updateMedication = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const updates = req.body

        // Make sure medication belongs to user
        const medication = await medicationModel.findOne({ _id: id, userId })
        if (!medication) {
            return res.status(404).json({ message: "Medication not found", status: false })
        }

        const updatedMedication = await medicationModel.findByIdAndUpdate(id, updates, { new: true })
        return res.status(200).json({ medication: updatedMedication, message: "Medication updated", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Delete medication
const deleteMedication = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        // Make sure medication belongs to user
        const medication = await medicationModel.findOne({ _id: id, userId })
        if (!medication) {
            return res.status(404).json({ message: "Medication not found", status: false })
        }

        await medicationModel.findByIdAndDelete(id)
        return res.status(200).json({ message: "Medication deleted", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

module.exports = { getMedications, addMedication, updateMedication, deleteMedication }