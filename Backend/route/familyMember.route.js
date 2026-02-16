const express = require("express")
const familyMemberRouter = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const { getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } = require("../controller/familyMember.controller")

// All routes require authentication
familyMemberRouter.get("/", authMiddleware, getFamilyMembers)
familyMemberRouter.post("/", authMiddleware, addFamilyMember)
familyMemberRouter.put("/:id", authMiddleware, updateFamilyMember)
familyMemberRouter.delete("/:id", authMiddleware, deleteFamilyMember)

module.exports = familyMemberRouter