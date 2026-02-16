const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(" ")[1] // "Bearer TOKEN"
        
        if (!token) {
            return res.status(401).json({ message: "No token provided", status: false })
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Add userId to request
        req.userId = decoded.userId
        
        // Continue to next middleware/controller
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: "Invalid or expired token", status: false })
    }
}

module.exports = authMiddleware