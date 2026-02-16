const usermodel = require("../model/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSignup = async(req, res) => {
    try {
        const {username, email, password} = req.body
        console.log(req.body);
        
        if (!username || !email || !password ) {
            return res.status(400).json({message: "All fields are required", status: false})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newuser = await usermodel.create({
                username,
                email,
                password: hashedPassword
        })
        if (newuser) {
            return res.status(200).json({message: "Signup successful", status: true})
        }      
   } catch (error) {
         console.log(error);
         
        if (error.message.includes("buffering timed out")) {  
            return res.status(500).json({message: "Network error", status: false})
        }
        if (error.message.includes("E11000 duplicate key error")) {
            return res.status(400).json({message: "User already exist", status: false})
            
        }
        
        return res.status(500).json({message: error.message, status: false})
    }
}

const userLogin = async(req, res) => {
    console.log("Logging in...");
    console.log(req.body);
    try {
        const {email, password} = req.body
        if (!email || !password) {
            return res.status(400).json({message: "All fields are required", status: false})
        }
        const existingUser = await usermodel.findOne({email})
        if (!existingUser) {
            return res.status(400).json({message: "Invalid email or password", status: false})
        }
        const hashedPassword = await bcrypt.compare(password, existingUser.password)
        if (!hashedPassword) {
            return res.status(400).json({message: "Invalid email or password", status: false})
        }
        
        // CREATE JWT TOKEN - ADD THESE LINES
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email }, 
            process.env.JWT_SECRET,  // You should use process.env.JWT_SECRET instead
            { expiresIn: "1h" }
        )
        
        // RETURN TOKEN
        return res.status(200).json({
            message: "login successful", 
            status: true,
            token: token,  // Add this
            user: {        // Add this (optional but helpful)
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message, status: false})
    }
}

module.exports = {userSignup, userLogin}