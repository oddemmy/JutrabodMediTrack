const familyMemberModel = require("../model/familyMember.model")

// Get all family members for a user
const getFamilyMembers = async (req, res) => {
    try {
        const userId = req.userId
        
        const members = await familyMemberModel.find({ userId, isActive: true }).sort({ createdAt: 1 })
        return res.status(200).json({ members, status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Add new family member
const addFamilyMember = async (req, res) => {
    try {
        const userId = req.userId
        const { name, relationship, age, gender, dateOfBirth, notes } = req.body

        if (!name || !relationship || !age) {
            return res.status(400).json({ message: "Name, relationship, and age are required", status: false })
        }

        const newMember = await familyMemberModel.create({
            userId,
            name,
            relationship,
            age,
            gender,
            dateOfBirth,
            notes
        })

        return res.status(201).json({ member: newMember, message: "Family member added", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Update family member
const updateFamilyMember = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const updates = req.body

        const member = await familyMemberModel.findOne({ _id: id, userId })
        if (!member) {
            return res.status(404).json({ message: "Family member not found", status: false })
        }

        const updatedMember = await familyMemberModel.findByIdAndUpdate(id, updates, { new: true })
        return res.status(200).json({ member: updatedMember, message: "Family member updated", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

// Delete (deactivate) family member
const deleteFamilyMember = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const member = await familyMemberModel.findOne({ _id: id, userId })
        if (!member) {
            return res.status(404).json({ message: "Family member not found", status: false })
        }

        // Soft delete - mark as inactive instead of deleting
        member.isActive = false
        await member.save()

        return res.status(200).json({ message: "Family member removed", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

module.exports = { getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember }