import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import axiosInstance from '../api/axiosInstance'
import { toast } from 'react-toastify'

const HealthMetrics = () => {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [activeMember, setActiveMember] = useState(null)
  const [isLoadingMember, setIsLoadingMember] = useState(true)

  const [formData, setFormData] = useState({
    metricType: "",
    value: "",
    unit: "",
    notes: "",
    measuredAt: ""
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
    fetchMetrics()
  }, [token, navigate, selectedType, activeMember, isLoadingMember])

  const fetchMetrics = async () => {
    try {
      const url = selectedType === 'all'
        ? "/health-metrics"
        : `/health-metrics?metricType=${selectedType}`
      const response = await axiosInstance.get(url, { headers: { Authorization: `Bearer ${token}` } })
      let allMetrics = response.data.metrics || []
      if (activeMember) {
        allMetrics = allMetrics.filter(item => item.familyMemberId && item.familyMemberId === activeMember._id)
      } else {
        allMetrics = allMetrics.filter(item => !item.familyMemberId)
      }
      setMetrics(allMetrics)
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error(error.response?.data?.message || "Failed to fetch metrics")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({...formData, [name]: value})
  }

  const handleAddMetric = async () => {
    if (!formData.metricType || !formData.value || !formData.unit) {
      toast.error("Please fill in required fields")
      return
    }
    const dataToSend = { ...formData, familyMemberId: activeMember?._id || null }
    try {
      await axiosInstance.post("/health-metrics", dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Metric added")
      await fetchMetrics()
      setFormData({ metricType: "", value: "", unit: "", notes: "", measuredAt: "" })
      setShowAddForm(false)
    } catch (error) {
      console.error("Save error:", error)
      toast.error(error.response?.data?.message || "Failed to add metric")
    }
  }

  const handleDeleteMetric = async (id) => {
    try {
      await axiosInstance.delete(`/health-metrics/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Metric deleted")
      fetchMetrics()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.response?.data?.message || "Failed to delete metric")
    }
  }

  const getMetricIcon = (type) => {
    switch(type) {
      case 'blood_pressure': return '❤️'
      case 'blood_sugar': return '🩸'
      case 'weight': return '⚖️'
      default: return '📊'
    }
  }

  const getMetricLabel = (type) => {
    switch(type) {
      case 'blood_pressure': return 'Blood Pressure'
      case 'blood_sugar': return 'Blood Sugar'
      case 'weight': return 'Weight'
      default: return type
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
              <p className="text-purple-400 text-sm font-semibold">Viewing health metrics for:</p>
              <p className="text-white text-lg font-bold">{activeMember.name}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {activeMember ? `${activeMember.name}'s Health Metrics` : "Health Metrics"}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Track vital health measurements</p>
            </div>
            <Button
              onclick={() => setShowAddForm(true)}
              text="+ Add Measurement"
              style="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedType === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('blood_pressure')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedType === 'blood_pressure' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              ❤️ Blood Pressure
            </button>
            <button
              onClick={() => setSelectedType('blood_sugar')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedType === 'blood_sugar' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              🩸 Blood Sugar
            </button>
            <button
              onClick={() => setSelectedType('weight')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedType === 'weight' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              ⚖️ Weight
            </button>
          </div>

          <div className="space-y-4">
            {metrics.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-gray-400">No measurements recorded yet.</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add Measurement" to get started</p>
              </div>
            ) : (
              metrics.map((metric) => (
                <div key={metric._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl sm:text-3xl">{getMetricIcon(metric.metricType)}</span>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">{getMetricLabel(metric.metricType)}</h3>
                          <p className="text-gray-400 text-sm">{new Date(metric.measuredAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-purple-400 text-xl sm:text-2xl font-semibold">
                        {metric.value} {metric.unit}
                      </p>
                      {metric.notes && (
                        <p className="text-gray-400 text-sm mt-2">{metric.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteMetric(metric._id)}
                      className="text-red-400 hover:text-red-300 px-3 py-1 self-start text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto modal-scroll">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Add Health Measurement</h2>

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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Measurement Type *</label>
                    <select name="metricType" value={formData.metricType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select type</option>
                      <option value="blood_pressure">Blood Pressure</option>
                      <option value="blood_sugar">Blood Sugar</option>
                      <option value="weight">Weight</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Value *</label>
                    <input name="value" type="text" value={formData.value} onChange={handleInputChange} placeholder="e.g., 120/80 or 95 or 70" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Unit *</label>
                    <input name="unit" type="text" value={formData.unit} onChange={handleInputChange} placeholder="e.g., mmHg, mg/dL, kg" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Measured At</label>
                    <input name="measuredAt" type="datetime-local" value={formData.measuredAt} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any additional notes..." rows="3" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button onclick={() => setShowAddForm(false)} text="Cancel" style="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg" />
                  <Button onclick={handleAddMetric} text="Add Measurement" style="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HealthMetrics