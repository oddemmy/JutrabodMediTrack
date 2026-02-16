const mongoose = require("mongoose")

const medicationSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    familyMemberId: {  // ADD THIS
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'family_members',
        default: null
    },
    medicationName: {type: String, required: true},
    dosage: {type: String, required: true},
    frequency: {type: String, required: true},  
    times: [{type: String}],
    instructions: {type: String},  
    startDate: {type: Date, required: true},
    endDate: {type: Date},  
    isActive: {type: Boolean, default: true},
// ADD THESE NEW FIELDS:
    quantityTotal: {
        type: Number,
        default: 0
    },
    quantityRemaining: {
        type: Number,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 7  // Alert when less than 7 doses left
    },
    refillReminderSent: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const medicationModel = mongoose.model("medication_collections", medicationSchema)

module.exports = medicationModel