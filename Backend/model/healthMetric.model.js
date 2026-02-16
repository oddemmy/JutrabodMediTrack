const mongoose = require("mongoose")

const healthMetricSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
     familyMemberId: {  // ADD THIS
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'family_members',
        default: null
    },
    metricType: {
        type: String,
        enum: ['blood_pressure', 'blood_sugar', 'weight'],
        required: true
    },
    value: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ""
    },
    measuredAt: {
        type: Date,
        default: Date.now
    }
}, {timestamps: true})

const healthMetricModel = mongoose.model("health_metrics", healthMetricSchema)

module.exports = healthMetricModel