const medicationModel = require("../model/medication.model")
const { checkDrugInteractions, checkLocalInteractions } = require("../services/drugInteraction.service")

// Check for drug interactions among user's active medications
const checkInteractions = async (req, res) => {
    try {
        const userId = req.userId
        
        // Get all active medications for the user
        const medications = await medicationModel.find({ 
            userId, 
            isActive: true 
        })
        
        if (medications.length < 2) {
            return res.status(200).json({ 
                hasInteractions: false, 
                interactions: [],
                message: "Need at least 2 medications to check interactions",
                status: true 
            })
        }
        
        // Try FDA API first
        let result = await checkDrugInteractions(medications)
        
        // If FDA API fails or finds nothing, use local database
        if (!result.hasInteractions || result.error) {
            result = checkLocalInteractions(medications)
        }
        
        return res.status(200).json({ 
            ...result,
            medicationCount: medications.length,
            status: true 
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

module.exports = { checkInteractions }