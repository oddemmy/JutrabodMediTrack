const userTokenModel = require("../model/userToken.model")

// Save or update FCM token
const saveUserToken = async (req, res) => {
    try {
        const userId = req.userId
        const { fcmToken } = req.body

        if (!fcmToken) {
            return res.status(400).json({ message: "FCM token is required", status: false })
        }

        // Check if token already exists for this user
        const existingToken = await userTokenModel.findOne({ userId })

        if (existingToken) {
            // Update existing token
            existingToken.fcmToken = fcmToken
            await existingToken.save()
            return res.status(200).json({ message: "Token updated", status: true })
        } else {
            // Create new token
            await userTokenModel.create({ userId, fcmToken })
            return res.status(201).json({ message: "Token saved", status: true })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, status: false })
    }
}

module.exports = { saveUserToken }