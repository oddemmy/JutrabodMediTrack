const pillTrackingModel = require("../model/pillTracking.model")
const medicationModel = require("../model/medication.model")

// Get pill tracking history
const getPillHistory = async (req, res) => {
    try {
        const userId = req.userId
        const { medicationId, date } = req.query
        
        const filter = { userId }
        
        if (medicationId) {
            filter.medicationId = medicationId
        }
        
        // If date provided, filter by that day
        if (date) {
            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)
            filter.takenAt = { $gte: startOfDay, $lte: endOfDay }
        }
        
        const history = await pillTrackingModel.find(filter)
            .populate('medicationId')
            .sort({ takenAt: -1 })
        
        return res.status(200).json({ history, status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Mark medication as taken
const markAsTaken = async (req, res) => {
    try {
        const userId = req.userId
        const { medicationId, scheduledTime, status, notes, familyMemberId } = req.body  // ADD familyMemberId

        if (!medicationId || !scheduledTime) {
            return res.status(400).json({ message: "Medication ID and scheduled time required", status: false })
        }

        const medication = await medicationModel.findOne({ _id: medicationId, userId })
        if (!medication) {
            return res.status(404).json({ message: "Medication not found", status: false })
        }

        const tracking = await pillTrackingModel.create({
            userId,
            familyMemberId,  // ADD THIS
            medicationId,
            scheduledTime,
            status: status || 'taken',
            notes: notes || "",
            takenAt: new Date()
        })

        if (status === 'taken' && medication.quantityRemaining > 0) {
            medication.quantityRemaining -= 1
            await medication.save()
        }

        return res.status(201).json({ 
            tracking, 
            message: `Medication marked as ${status || 'taken'}`, 
            status: true,
            quantityRemaining: medication.quantityRemaining
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Get today's medication schedule
const getTodaySchedule = async (req, res) => {
    try {
        const userId = req.userId
        
        // Get all active medications
        const medications = await medicationModel.find({ userId, isActive: true })
        
        // Get today's tracking records
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        const todayTracking = await pillTrackingModel.find({
            userId,
            takenAt: { $gte: today, $lt: tomorrow }
        })
        
        // Build schedule with tracking status
        const schedule = medications.map(med => {
            const tracked = todayTracking.find(t => 
                t.medicationId.toString() === med._id.toString() &&
                t.scheduledTime === med.times[0]
            )
            
            return {
                medication: med,
                scheduledTime: med.times[0],
                status: tracked ? tracked.status : 'pending',
                trackedAt: tracked ? tracked.takenAt : null,
                trackingId: tracked ? tracked._id : null
            }
        })
        
        return res.status(200).json({ schedule, status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Delete tracking record
const deleteTracking = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const tracking = await pillTrackingModel.findOne({ _id: id, userId })
        if (!tracking) {
            return res.status(404).json({ message: "Tracking record not found", status: false })
        }

        await pillTrackingModel.findByIdAndDelete(id)
        return res.status(200).json({ message: "Tracking record deleted", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

module.exports = { getPillHistory, markAsTaken, getTodaySchedule, deleteTracking }