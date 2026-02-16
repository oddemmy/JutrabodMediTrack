import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import axios from 'axios'
import { toast } from 'react-toastify'

const Medications = () => {
  const navigate = useNavigate()
  const [medications, setMedications] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState(null)
  const [activeMember, setActiveMember] = useState(null)
  const [isLoadingMember, setIsLoadingMember] = useState(true)

  const [formData, setFormData] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    times: [],
    instructions: "",
    startDate: "",
    endDate: "",
    isActive: true,
    quantityTotal: 0,
    quantityRemaining: 0,
    lowStockThreshold: 7
  })

  const token = localStorage.getItem("token")

  useEffect(() => {
    const loadActiveMember = () => {
      try {
        const saved = localStorage.getItem('activeFamilyMember')
        const member = saved ? JSON.parse(saved) : null
        setActiveMember(member)
      } catch (error) {
        console.error("Error loading active member:", error)
        setActiveMember(null)
      } finally {
        setIsLoadingMember(false)
      }
    }
    loadActiveMember()
    const handleFamilyChange = () => { setIsLoadingMember(true); loadActiveMember() }
    window.addEventListener('familyMemberChanged', handleFamilyChange)
    return () => window.removeEventListener('familyMemberChanged', handleFamilyChange)
  }, [])

  useEffect(() => {
    if (!token) { navigate("/login"); return }
    if (isLoadingMember) return
    fetchMedications()
  }, [token, navigate, activeMember, isLoadingMember])

  const fetchMedications = async () => {
    try {
      const response = await axios.get("http://localhost:8007/medications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      let allMedications = response.data.medications || []
      if (activeMember) {
        allMedications = allMedications.filter(med => med.familyMemberId && med.familyMemberId === activeMember._id)
      } else {
        allMedications = allMedications.filter(med => !med.familyMemberId)
      }
      setMedications(allMedications)
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error(error.response?.data?.message || "Failed to fetch medications")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === "times") {
      setFormData({...formData, times: [value]})
    } else {
      setFormData({...formData, [name]: value})
    }
  }

  const handleAddMedication = async () => {
    if (!formData.medicationName || !formData.dosage || !formData.frequency) {
      toast.error("Please fill in required fields")
      return
    }
    const dataToSend = { ...formData, familyMemberId: activeMember?._id || null }
    try {
      if (editingMedication) {
        await axios.put(`http://localhost:8007/medications/${editingMedication}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success("Medication updated")
        setEditingMedication(null)
      } else {
        await axios.post("http://localhost:8007/medications", dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success("Medication added")
      }
      await fetchMedications()
      setFormData({ medicationName: "", dosage: "", frequency: "", times: [], instructions: "", startDate: "", endDate: "", isActive: true, quantityTotal: 0, quantityRemaining: 0, lowStockThreshold: 7 })
      setShowAddForm(false)
    } catch (error) {
      console.error("Save error:", error)
      toast.error(error.response?.data?.message || "Failed to save medication")
    }
  }

  const handleDeleteMedication = async (id) => {
    try {
      await axios.delete(`http://localhost:8007/medications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Medication deleted")
      fetchMedications()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.response?.data?.message || "Failed to delete medication")
    }
  }

  const handleEditMedication = (med) => {
    setFormData({
      medicationName: med.medicationName,
      dosage: med.dosage,
      frequency: med.frequency,
      times: med.times || [],
      instructions: med.instructions || "",
      startDate: med.startDate || "",
      endDate: med.endDate || "",
      isActive: med.isActive !== undefined ? med.isActive : true,
      quantityTotal: med.quantityTotal || 0,
      quantityRemaining: med.quantityRemaining || 0,
      lowStockThreshold: med.lowStockThreshold || 7
    })
    setEditingMedication(med._id)
    setShowAddForm(true)
  }

  return (
    <div>
      {isLoadingMember ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {activeMember && (
            <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-4 mb-6">
              <p className="text-purple-400 text-sm font-semibold">Viewing medications for:</p>
              <p className="text-white text-lg font-bold">{activeMember.name}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {activeMember ? `${activeMember.name}'s Medications` : "My Medications"}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Manage medication schedule</p>
            </div>
            <Button
              onclick={() => setShowAddForm(true)}
              text="+ Add Medication"
              style="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
            />
          </div>

          <div className="space-y-4">
            {medications.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-gray-400">No medications added yet.</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add Medication" to get started</p>
              </div>
            ) : (
              medications.map((med) => (
                <div key={med._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{med.medicationName}</h3>
                      <p className="text-purple-400 font-semibold">{med.dosage}</p>
                    </div>
                    <div className="flex gap-2 self-start">
                      <button
                        onClick={() => handleEditMedication(med)}
                        className="text-blue-400 hover:text-blue-300 px-3 py-1 text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMedication(med._id)}
                        className="text-red-400 hover:text-red-300 px-3 py-1 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Frequency</p>
                      <p className="text-white font-medium">{med.frequency}</p>
                    </div>
                    {med.times && med.times.length > 0 && (
                      <div>
                        <p className="text-gray-400">Time</p>
                        <p className="text-white font-medium">{med.times[0]}</p>
                      </div>
                    )}
                  </div>

                  {med.quantityTotal > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-gray-400 text-sm">Stock</p>
                          <p className={`text-lg font-bold ${med.quantityRemaining <= med.lowStockThreshold ? 'text-red-400' : 'text-green-400'}`}>
                            {med.quantityRemaining} / {med.quantityTotal} doses
                          </p>
                        </div>
                        {med.quantityRemaining <= med.lowStockThreshold && (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold self-start sm:self-auto">
                            ⚠️ LOW STOCK
                          </span>
                        )}
                      </div>
                      {med.quantityRemaining <= 0 && (
                        <p className="text-red-400 text-sm mt-2">❌ Out of stock - Please refill!</p>
                      )}
                    </div>
                  )}

                  {med.instructions && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm">Instructions</p>
                      <p className="text-white text-sm mt-1">{med.instructions}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-scroll">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
                  {editingMedication ? "Edit Medication" : "Add New Medication"}
                </h2>

                {activeMember && (
                  <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-purple-400 text-xs font-semibold">Adding for</p>
                      <p className="text-white font-bold">{activeMember.name}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Medication Name *</label>
                    <input name="medicationName" type="text" value={formData.medicationName} onChange={handleInputChange} placeholder="e.g., Aspirin" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dosage *</label>
                    <input name="dosage" type="text" value={formData.dosage} onChange={handleInputChange} placeholder="e.g., 100mg" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Frequency *</label>
                    <select name="frequency" value={formData.frequency} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select frequency</option>
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Every 8 hours">Every 8 hours</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                    <input name="times" type="time" value={formData.times[0] || ""} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Instructions</label>
                    <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} placeholder="e.g., Take with food" rows="3" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date (Optional)</label>
                    <input name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Total Quantity (pills/doses)</label>
                    <input name="quantityTotal" type="number" value={formData.quantityTotal} onChange={(e) => { const total = parseInt(e.target.value) || 0; setFormData({...formData, quantityTotal: total, quantityRemaining: total}) }} placeholder="e.g., 30" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Alert When Below (doses)</label>
                    <input name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleInputChange} placeholder="e.g., 7" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <p className="text-gray-500 text-xs mt-1">You'll be notified when stock is low</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button onclick={() => setShowAddForm(false)} text="Cancel" style="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg" />
                  <Button onclick={handleAddMedication} text={editingMedication ? "Update Medication" : "Add Medication"} style="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Medications