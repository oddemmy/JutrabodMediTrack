const symptomModel = require("../model/symptom.model")

// Get all symptoms for a user
const getSymptoms = async (req, res) => {
    try {
        const userId = req.userId
        const { startDate, endDate } = req.query
        
        const filter = { userId }
        
        // Optional date range filter
        if (startDate && endDate) {
            filter.occurredAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }
        
        const symptoms = await symptomModel.find(filter)
            .populate('relatedMedication')
            .sort({ occurredAt: -1 })
        
        return res.status(200).json({ symptoms, status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Add new symptom
const addSymptom = async (req, res) => {
    try {
        const userId = req.userId
        const { symptomName, severity, occurredAt, duration, notes, relatedMedication, familyMemberId } = req.body  // ADD familyMemberId

        if (!symptomName || !severity) {
            return res.status(400).json({ message: "Symptom name and severity are required", status: false })
        }

        const newSymptom = await symptomModel.create({
            userId,
            familyMemberId,  // ADD THIS
            symptomName,
            severity,
            occurredAt: occurredAt || Date.now(),
            duration,
            notes,
            relatedMedication: relatedMedication || null
        })

        return res.status(201).json({ symptom: newSymptom, message: "Symptom logged", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Update symptom
const updateSymptom = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const updates = req.body

        const symptom = await symptomModel.findOne({ _id: id, userId })
        if (!symptom) {
            return res.status(404).json({ message: "Symptom not found", status: false })
        }

        const updatedSymptom = await symptomModel.findByIdAndUpdate(id, updates, { new: true })
        return res.status(200).json({ symptom: updatedSymptom, message: "Symptom updated", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Delete symptom
const deleteSymptom = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const symptom = await symptomModel.findOne({ _id: id, userId })
        if (!symptom) {
            return res.status(404).json({ message: "Symptom not found", status: false })
        }

        await symptomModel.findByIdAndDelete(id)
        return res.status(200).json({ message: "Symptom deleted", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

module.exports = { getSymptoms, addSymptom, updateSymptom, deleteSymptom }