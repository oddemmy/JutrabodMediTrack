import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import axios from 'axios'
import { toast } from 'react-toastify'

const TodaySchedule = () => {
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeMember, setActiveMember] = useState(null)
  const [isLoadingMember, setIsLoadingMember] = useState(true)

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
    fetchTodaySchedule()
  }, [token, navigate, activeMember, isLoadingMember])

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:8007/pill-tracking/today", {
        headers: { Authorization: `Bearer ${token}` }
      })
      let allSchedules = response.data.schedule || []
      if (activeMember) {
        allSchedules = allSchedules.filter(item =>
          item.medication.familyMemberId && item.medication.familyMemberId === activeMember._id
        )
      } else {
        allSchedules = allSchedules.filter(item => !item.medication.familyMemberId)
      }
      setSchedule(allSchedules)
      setLoading(false)
    } catch (error) {
      console.error("Fetch error:", error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch schedule")
      }
      setLoading(false)
    }
  }

  const markAsTaken = async (medicationId, scheduledTime, status) => {
    try {
      await axios.post(
        "http://localhost:8007/pill-tracking",
        { medicationId, scheduledTime, status, familyMemberId: activeMember?._id || null },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Medication marked as ${status}`)
      fetchTodaySchedule()
    } catch (error) {
      console.error("Mark error:", error)
      toast.error(error.response?.data?.message || "Failed to update status")
    }
  }

  const undoTracking = async (trackingId) => {
    try {
      await axios.delete(`http://localhost:8007/pill-tracking/${trackingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Action undone")
      fetchTodaySchedule()
    } catch (error) {
      console.error("Undo error:", error)
      toast.error(error.response?.data?.message || "Failed to undo")
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'taken': return 'bg-green-500/20 text-green-400'
      case 'missed': return 'bg-red-500/20 text-red-400'
      case 'skipped': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'taken': return '✅'
      case 'missed': return '❌'
      case 'skipped': return '⏭️'
      default: return '⏰'
    }
  }

  if (isLoadingMember || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  const pendingCount = schedule.filter(s => s.status === 'pending').length
  const takenCount = schedule.filter(s => s.status === 'taken').length
  const missedCount = schedule.filter(s => s.status === 'missed').length

  return (
    <div>
      {activeMember && (
        <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-4 mb-6">
          <p className="text-purple-400 text-sm font-semibold">Viewing schedule for:</p>
          <p className="text-white text-lg font-bold">{activeMember.name}</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {activeMember ? `${activeMember.name}'s Schedule` : "Today's Medication Schedule"}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">Track daily medication intake</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl">📋</span>
            <span className="text-purple-400 text-xs sm:text-sm font-semibold">TOTAL</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">{schedule.length}</h3>
          <p className="text-gray-400 text-xs sm:text-sm">Medications</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl">✅</span>
            <span className="text-green-400 text-xs sm:text-sm font-semibold">TAKEN</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">{takenCount}</h3>
          <p className="text-gray-400 text-xs sm:text-sm">Completed</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl">⏰</span>
            <span className="text-yellow-400 text-xs sm:text-sm font-semibold">PENDING</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">{pendingCount}</h3>
          <p className="text-gray-400 text-xs sm:text-sm">Remaining</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl sm:text-3xl">❌</span>
            <span className="text-red-400 text-xs sm:text-sm font-semibold">MISSED</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">{missedCount}</h3>
          <p className="text-gray-400 text-xs sm:text-sm">Missed</p>
        </div>
      </div>

      <div className="space-y-4">
        {schedule.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">No medications scheduled for today.</p>
            <p className="text-gray-500 text-sm mt-2">Add medications to see your schedule</p>
            <button
              onClick={() => navigate('/dashboard/medications')}
              className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
            >
              Go to Medications
            </button>
          </div>
        ) : (
          schedule.map((item) => (
            <div key={item.medication._id + item.scheduledTime} className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl">💊</span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">{item.medication.medicationName}</h3>
                      <p className="text-purple-400 font-semibold text-sm sm:text-base">{item.medication.dosage}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-400 mt-2">
                    <span>⏰ {item.scheduledTime}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
                      {getStatusIcon(item.status)} {item.status.toUpperCase()}
                    </span>
                    {item.trackedAt && (
                      <span className="text-gray-500 text-xs">
                        at {new Date(item.trackedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  {item.medication.instructions && (
                    <p className="text-gray-400 text-sm mt-2">📝 {item.medication.instructions}</p>
                  )}
                </div>

                <div className="flex flex-row sm:flex-col gap-2 flex-wrap">
                  {item.status === 'pending' ? (
                    <>
                      <Button onclick={() => markAsTaken(item.medication._id, item.scheduledTime, 'taken')} text="✅ Taken" style="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm" />
                      <Button onclick={() => markAsTaken(item.medication._id, item.scheduledTime, 'missed')} text="❌ Missed" style="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm" />
                      <Button onclick={() => markAsTaken(item.medication._id, item.scheduledTime, 'skipped')} text="⏭️ Skip" style="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm" />
                    </>
                  ) : (
                    <Button onclick={() => undoTracking(item.trackingId)} text="↩️ Undo" style="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TodaySchedule