const healthMetricModel = require("../model/healthMetric.model")

// Get all health metrics for a user
const getHealthMetrics = async (req, res) => {
    try {
        const userId = req.userId
        const { metricType } = req.query // Optional filter by type
        
        const filter = { userId }
        if (metricType) {
            filter.metricType = metricType
        }
        
        const metrics = await healthMetricModel.find(filter).sort({ measuredAt: -1 })
        return res.status(200).json({ metrics, status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Add new health metric
const addHealthMetric = async (req, res) => {
    try {
        const userId = req.userId
        const { metricType, value, unit, notes, measuredAt, familyMemberId } = req.body  // ADD familyMemberId

        if (!metricType || !value || !unit) {
            return res.status(400).json({ message: "Metric type, value, and unit are required", status: false })
        }

        const newMetric = await healthMetricModel.create({
            userId,
            familyMemberId,  // ADD THIS
            metricType,
            value,
            unit,
            notes,
            measuredAt: measuredAt || Date.now()
        })

        return res.status(201).json({ metric: newMetric, message: "Health metric added", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}
// Delete health metric
const deleteHealthMetric = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const metric = await healthMetricModel.findOne({ _id: id, userId })
        if (!metric) {
            return res.status(404).json({ message: "Metric not found", status: false })
        }

        await healthMetricModel.findByIdAndDelete(id)
        return res.status(200).json({ message: "Metric deleted", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

module.exports = { getHealthMetrics, addHealthMetric, deleteHealthMetric }