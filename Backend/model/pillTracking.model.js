const mongoose = require("mongoose")

const pillTrackingSchema = mongoose.Schema({
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
    medicationId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'medication_collections', 
        required: true
    },
    takenAt: {
        type: Date,
        default: Date.now
    },
    scheduledTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['taken', 'missed', 'skipped'],
        default: 'taken'
    },
    notes: {
        type: String,
        default: ""
    }
}, {timestamps: true})

const pillTrackingModel = mongoose.model("pill_tracking", pillTrackingSchema)

module.exports = pillTrackingModel