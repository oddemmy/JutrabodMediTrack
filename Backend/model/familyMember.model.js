 const mongoose = require("mongoose")

const familyMemberSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    relationship: {
        type: String,
        enum: ['self', 'spouse', 'child', 'parent', 'sibling', 'other'],
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    dateOfBirth: {
        type: Date
    },
    notes: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true})

const familyMemberModel = mongoose.model("family_members", familyMemberSchema)

module.exports = familyMemberModel