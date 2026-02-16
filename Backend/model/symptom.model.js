const mongoose = require("mongoose")

const symptomSchema = mongoose.Schema({
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
    symptomName: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        required: true
    },
    occurredAt: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: String,
        default: ""
    },
    notes: {
        type: String,
        default: ""
    },
    relatedMedication: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'medication_collections',
        default: null
    }
}, {timestamps: true})

const symptomModel = mongoose.model("symptoms", symptomSchema)

module.exports = symptomModel