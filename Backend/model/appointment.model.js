const mongoose = require("mongoose")

const appointmentSchema = mongoose.Schema({
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
    doctorName: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        default: ""
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        default: ""
    },
    reason: {
        type: String,
        default: ""
    },
    notes: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled'],
        default: 'upcoming'
    }
}, {timestamps: true})

const appointmentModel = mongoose.model("appointments", appointmentSchema)

module.exports = appointmentModel