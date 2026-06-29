import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import axiosInstance from '../api/axiosInstance'
import { toast } from 'react-toastify'

const FamilyMembers = () => {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [activeMember, setActiveMember] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    age: "",
    gender: "other",
    dateOfBirth: "",
    notes: ""
  })

  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    fetchFamilyMembers()
    const savedMember = localStorage.getItem('activeFamilyMember')
    if (savedMember) setActiveMember(JSON.parse(savedMember))
  }, [token, navigate])

  const fetchFamilyMembers = async () => {
    try {
      const response = await axiosInstance.get("/family-members", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMembers(response.data.members || [])
    } catch (error) {
      console.log(error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch family members")
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({...formData, [name]: value})
  }

  const handleAddMember = async () => {
    if (!formData.name || !formData.relationship || !formData.age) {
      toast.error("Name, relationship, and age are required")
      return
    }
    try {
      if (editingMember) {
        const response = await axiosInstance.put(`/family-members/${editingMember}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success(response.data.message)
        setEditingMember(null)
      } else {
        const response = await axiosInstance.post("/family-members", formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success(response.data.message)
      }
      fetchFamilyMembers()
      setFormData({ name: "", relationship: "", age: "", gender: "other", dateOfBirth: "", notes: "" })
      setShowAddForm(false)
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to save family member")
    }
  }

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this family member?")) return
    try {
      const response = await axiosInstance.delete(`/family-members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(response.data.message)
      if (activeMember?._id === id) {
        setActiveMember(null)
        localStorage.removeItem('activeFamilyMember')
      }
      fetchFamilyMembers()
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to delete family member")
    }
  }

  const handleEditMember = (member) => {
    setFormData({
      name: member.name,
      relationship: member.relationship,
      age: member.age,
      gender: member.gender || "other",
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : "",
      notes: member.notes || ""
    })
    setEditingMember(member._id)
    setShowAddForm(true)
  }

  const handleSetActive = (member) => {
    setActiveMember(member)
    localStorage.setItem('activeFamilyMember', JSON.stringify(member))
    window.dispatchEvent(new Event('familyMemberChanged'))
    toast.success(`Switched to ${member.name}'s profile`)
  }

  const handleClearActive = () => {
    setActiveMember(null)
    localStorage.removeItem('activeFamilyMember')
    window.dispatchEvent(new Event('familyMemberChanged'))
    toast.info("Viewing my profile")
  }

  const getRelationshipIcon = (relationship) => {
    switch(relationship) {
      case 'self': return '👤'
      case 'spouse': return '💑'
      case 'child': return '👶'
      case 'parent': return '👴'
      case 'sibling': return '👫'
      default: return '👥'
    }
  }

  const getGenderIcon = (gender) => {
    switch(gender) {
      case 'male': return '♂️'
      case 'female': return '♀️'
      default: return '⚧️'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Family Members</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage health profiles for your family</p>
        </div>
        <Button
          onclick={() => setShowAddForm(true)}
          text="+ Add Family Member"
          style="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
        />
      </div>

      {/* Active Member Banner */}
      {activeMember && (
        <div className="bg-purple-500/20 border border-purple-500 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getRelationshipIcon(activeMember.relationship)}</span>
            <div>
              <p className="text-purple-400 text-sm font-semibold">Currently Viewing</p>
              <p className="text-white font-bold">{activeMember.name}'s Profile</p>
            </div>
          </div>
          <Button
            onclick={handleClearActive}
            text="View My Profile"
            style="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto"
          />
        </div>
      )}

      {!activeMember && (
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-3xl">👤</span>
          <div>
            <p className="text-blue-400 text-sm font-semibold">Currently Viewing</p>
            <p className="text-white font-bold">My Profile (Main Account)</p>
          </div>
        </div>
      )}

      {/* Family Members List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {members.length === 0 ? (
          <div className="col-span-full bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <p className="text-gray-400 mb-2">No family members added yet</p>
            <p className="text-gray-500 text-sm">Add family members to manage their health profiles</p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member._id}
              className={`bg-gray-800 border-2 rounded-xl p-4 sm:p-6 transition cursor-pointer ${
                activeMember?._id === member._id ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => handleSetActive(member)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{getRelationshipIcon(member.relationship)}</span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-purple-400 text-sm capitalize">{member.relationship}</p>
                  </div>
                </div>
                {activeMember?._id === member._id && (
                  <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-semibold">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span>{getGenderIcon(member.gender)}</span>
                  <span className="text-gray-400">Age:</span>
                  <span className="text-white font-medium">{member.age} years</span>
                </div>
                {member.dateOfBirth && (
                  <div className="flex items-center gap-2">
                    <span>🎂</span>
                    <span className="text-gray-400">DOB:</span>
                    <span className="text-white font-medium">{new Date(member.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {member.notes && (
                <div className="bg-gray-900/50 rounded p-3 mb-4">
                  <p className="text-gray-400 text-xs mb-1">Notes</p>
                  <p className="text-white text-sm">{member.notes}</p>
                </div>
              )}

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleEditMember(member)}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-lg text-sm transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteMember(member._id)}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm transition"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-scroll">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
              {editingMember ? "Edit Family Member" : "Add Family Member"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Relationship *</label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select relationship</option>
                  <option value="self">Self</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age *</label>
                <input
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g., 25"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onclick={() => setShowAddForm(false)}
                text="Cancel"
                style="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg"
              />
              <Button
                onclick={handleAddMember}
                text={editingMember ? "Update Member" : "Add Member"}
                style="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FamilyMembers