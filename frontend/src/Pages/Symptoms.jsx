import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import axios from 'axios'
import { toast } from 'react-toastify'

const Symptoms = () => {
  const navigate = useNavigate()
  const [symptoms, setSymptoms] = useState([])
  const [medications, setMedications] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSymptom, setEditingSymptom] = useState(null)
  const [activeMember, setActiveMember] = useState(null)
  const [isLoadingMember, setIsLoadingMember] = useState(true)

  const [formData, setFormData] = useState({
    symptomName: "",
    severity: "",
    occurredAt: "",
    duration: "",
    notes: "",
    relatedMedication: ""
  })

  const token = localStorage.getItem("token")

  const commonSymptoms = [
    "Headache", "Nausea", "Fatigue", "Dizziness", "Fever",
    "Cough", "Shortness of breath", "Chest pain", "Stomach ache",
    "Insomnia", "Anxiety", "Back pain", "Joint pain", "Rash"
  ]

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
    fetchSymptoms()
    fetchMedications()
  }, [token, navigate, activeMember, isLoadingMember])

  const fetchSymptoms = async () => {
    try {
      const response = await axios.get("http://localhost:8007/symptoms", { headers: { Authorization: `Bearer ${token}` } })
      let allSymptoms = response.data.symptoms || []
      if (activeMember) {
        allSymptoms = allSymptoms.filter(item => item.familyMemberId && item.familyMemberId === activeMember._id)
      } else {
        allSymptoms = allSymptoms.filter(item => !item.familyMemberId)
      }
      setSymptoms(allSymptoms)
    } catch (error) {
      console.error("Fetch error:", error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch symptoms")
      }
    }
  }

  const fetchMedications = async () => {
    try {
      const response = await axios.get("http://localhost:8007/medications", { headers: { Authorization: `Bearer ${token}` } })
      setMedications(response.data.medications || [])
    } catch (error) {
      console.error("Fetch medications error:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({...formData, [name]: value})
  }

  const handleAddSymptom = async () => {
    if (!formData.symptomName || !formData.severity) {
      toast.error("Symptom name and severity are required")
      return
    }
    const dataToSend = { ...formData, familyMemberId: activeMember?._id || null }
    try {
      if (editingSymptom) {
        await axios.put(`http://localhost:8007/symptoms/${editingSymptom}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success("Symptom updated")
        setEditingSymptom(null)
      } else {
        await axios.post("http://localhost:8007/symptoms", dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success("Symptom logged")
      }
      await fetchSymptoms()
      setFormData({ symptomName: "", severity: "", occurredAt: "", duration: "", notes: "", relatedMedication: "" })
      setShowAddForm(false)
    } catch (error) {
      console.error("Save error:", error)
      toast.error(error.response?.data?.message || "Failed to save symptom")
    }
  }

  const handleDeleteSymptom = async (id) => {
    try {
      await axios.delete(`http://localhost:8007/symptoms/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success("Symptom deleted")
      fetchSymptoms()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.response?.data?.message || "Failed to delete symptom")
    }
  }

  const handleEditSymptom = (symptom) => {
    setFormData({
      symptomName: symptom.symptomName,
      severity: symptom.severity,
      occurredAt: new Date(symptom.occurredAt).toISOString().slice(0, 16),
      duration: symptom.duration || "",
      notes: symptom.notes || "",
      relatedMedication: symptom.relatedMedication?._id || ""
    })
    setEditingSymptom(symptom._id)
    setShowAddForm(true)
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'mild': return 'bg-yellow-500/20 text-yellow-400'
      case 'moderate': return 'bg-orange-500/20 text-orange-400'
      case 'severe': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'mild': return '🟡'
      case 'moderate': return '🟠'
      case 'severe': return '🔴'
      default: return '⚪'
    }
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
              <p className="text-purple-400 text-sm font-semibold">Viewing symptoms for:</p>
              <p className="text-white text-lg font-bold">{activeMember.name}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {activeMember ? `${activeMember.name}'s Symptom Logger` : "Symptom Logger"}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Track and monitor symptoms</p>
            </div>
            <Button
              onclick={() => setShowAddForm(true)}
              text="+ Log Symptom"
              style="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
            />
          </div>

          <div className="space-y-4">
            {symptoms.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-gray-400">No symptoms logged yet.</p>
                <p className="text-gray-500 text-sm mt-2">Click "Log Symptom" to track your symptoms</p>
              </div>
            ) : (
              symptoms.map((symptom) => (
                <div key={symptom._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl sm:text-3xl">🤒</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">{symptom.symptomName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(symptom.severity)}`}>
                              {getSeverityIcon(symptom.severity)} {symptom.severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-gray-400 mt-3">
                        <p>📅 {new Date(symptom.occurredAt).toLocaleString()}</p>
                        {symptom.duration && <p>⏱️ Duration: {symptom.duration}</p>}
                        {symptom.relatedMedication && (
                          <p>💊 Related to: {symptom.relatedMedication.medicationName}</p>
                        )}
                      </div>

                      {symptom.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-gray-400 text-sm">Notes</p>
                          <p className="text-white text-sm mt-1">{symptom.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 self-start">
                      <button onClick={() => handleEditSymptom(symptom)} className="text-blue-400 hover:text-blue-300 px-3 py-1 text-sm">✏️ Edit</button>
                      <button onClick={() => handleDeleteSymptom(symptom._id)} className="text-red-400 hover:text-red-300 px-3 py-1 text-sm">🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-scroll">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
                  {editingSymptom ? "Edit Symptom" : "Log New Symptom"}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Symptom *</label>
                    <input name="symptomName" type="text" list="common-symptoms" value={formData.symptomName} onChange={handleInputChange} placeholder="e.g., Headache" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    <datalist id="common-symptoms">
                      {commonSymptoms.map(symptom => (
                        <option key={symptom} value={symptom} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Severity *</label>
                    <select name="severity" value={formData.severity} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select severity</option>
                      <option value="mild">🟡 Mild</option>
                      <option value="moderate">🟠 Moderate</option>
                      <option value="severe">🔴 Severe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">When did it occur?</label>
                    <input name="occurredAt" type="datetime-local" value={formData.occurredAt} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                    <input name="duration" type="text" value={formData.duration} onChange={handleInputChange} placeholder="e.g., 2 hours, All day" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Related Medication (Optional)</label>
                    <select name="relatedMedication" value={formData.relatedMedication} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">None</option>
                      {medications.map(med => (
                        <option key={med._id} value={med._id}>{med.medicationName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any additional details..." rows="3" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button onclick={() => setShowAddForm(false)} text="Cancel" style="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg" />
                  <Button onclick={handleAddSymptom} text={editingSymptom ? "Update Symptom" : "Log Symptom"} style="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Symptoms