import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import axiosInstance from '../api/axiosInstance'
import { toast } from 'react-toastify'

const DrugInteractions = () => {
  const navigate = useNavigate()
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasInteractions, setHasInteractions] = useState(false)
  const [medicationCount, setMedicationCount] = useState(0)

  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }
  }, [token, navigate])

  const checkInteractions = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get("/drug-interactions/check", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInteractions(response.data.interactions || [])
      setHasInteractions(response.data.hasInteractions)
      setMedicationCount(response.data.medicationCount || 0)
      if (response.data.hasInteractions) {
        toast.warning(`Found ${response.data.interactions.length} potential interaction(s)`)
      } else {
        toast.success("No known interactions found!")
      }
      setLoading(false)
    } catch (error) {
      console.log(error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        toast.error(error.response?.data?.message || "Failed to check interactions")
      }
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'severe':
      case 'major':
        return 'bg-red-500/20 text-red-400 border-red-500'
      case 'moderate':
        return 'bg-orange-500/20 text-orange-400 border-orange-500'
      case 'mild':
      case 'minor':
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Medication Interaction Checker</h1>
        <p className="text-gray-400 text-sm sm:text-base">Check for potential drug interactions between your medications</p>
      </div>

      {/* Check Button */}
      <div className="mb-8">
        <Button
          onclick={checkInteractions}
          text={loading ? "Checking..." : "🔍 Check My Medications"}
          disabled={loading}
          style="bg-purple-500 hover:bg-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold w-full sm:w-auto"
        />
        {medicationCount > 0 && (
          <p className="text-gray-400 text-sm mt-2">
            Checking {medicationCount} active medication{medicationCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Results */}
      {!loading && interactions.length === 0 && medicationCount === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 text-center">
          <div className="text-5xl sm:text-6xl mb-4">💊</div>
          <p className="text-gray-400 mb-2">No medications to check</p>
          <p className="text-gray-500 text-sm">Add medications to check for interactions</p>
          <button
            onClick={() => navigate('/dashboard/medications')}
            className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
          >
            Go to Medications
          </button>
        </div>
      )}

      {!loading && !hasInteractions && medicationCount > 0 && (
        <div className="bg-green-500/10 border border-green-500 rounded-xl p-6 sm:p-8 text-center">
          <div className="text-5xl sm:text-6xl mb-4">✅</div>
          <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-2">All Clear!</h3>
          <p className="text-gray-300 text-sm sm:text-base">No known interactions found between your medications</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-4">
            ⚠️ Note: This checker uses publicly available databases. Always consult your doctor or pharmacist about potential interactions.
          </p>
        </div>
      )}

      {!loading && hasInteractions && (
        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <span className="text-3xl sm:text-4xl">⚠️</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-2">
                  {interactions.length} Potential Interaction{interactions.length !== 1 ? 's' : ''} Found
                </h3>
                <p className="text-gray-300 text-sm">
                  Please review these interactions and consult your healthcare provider immediately if concerned.
                </p>
              </div>
            </div>
          </div>

          {/* Interactions List */}
          {interactions.map((interaction, index) => (
            <div key={index} className={`border-2 rounded-xl p-4 sm:p-6 ${getSeverityColor(interaction.severity)}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-2 break-words">
                    {interaction.drug1} ⚡ {interaction.drug2}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(interaction.severity)}`}>
                    {interaction.severity?.toUpperCase() || 'WARNING'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 mb-3">
                <p className="text-white text-sm leading-relaxed">
                  {interaction.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-gray-500">
                <span>Source: {interaction.source}</span>
                <span>💡 Consult your doctor</span>
              </div>
            </div>
          ))}

          {/* Disclaimer */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 mt-6">
            <h4 className="text-white font-semibold mb-2">📋 Important Disclaimer</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              This interaction checker is for informational purposes only and should not replace professional medical advice.
              The database may not include all possible interactions. Always consult your doctor or pharmacist before
              starting, stopping, or changing any medications.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DrugInteractions