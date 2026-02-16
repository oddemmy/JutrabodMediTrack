import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointments = () => {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [activeMember, setActiveMember] = useState(null)
  const [isLoadingMember, setIsLoadingMember] = useState(true)

  const [formData, setFormData] = useState({
    doctorName: "",
    specialty: "",
    appointmentDate: "",
    location: "",
    reason: "",
    notes: "",
    status: "upcoming"
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
    fetchAppointments()
  }, [token, navigate, selectedStatus, activeMember, isLoadingMember])

  const fetchAppointments = async () => {
    try {
      const url = selectedStatus === 'all'
        ? "http://localhost:8007/appointments"
        : `http://localhost:8007/appointments?status=${selectedStatus}`
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      let allAppointments = response.data.appointments || []
      if (activeMember) {
        allAppointments = allAppointments.filter(item => item.familyMemberId && item.familyMemberId === activeMember._id)
      } else {
        allAppointments = allAppointments.filter(item => !item.familyMemberId)
      }
      setAppointments(allAppointments)
    } catch (error) {
      console.error("Fetch error:", error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch appointments")
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({...formData, [name]: value})
  }

  const handleAddAppointment = async () => {
    if (!formData.doctorName || !formData.appointmentDate) {
      toast.error("Doctor name and date are required")
      return
    }
    const dataToSend = { ...formData, familyMemberId: activeMember?._id || null }
    try {
      if (editingAppointment) {
        await axios.put(`http://localhost:8007/appointments/${editingAppointment}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success("Appointment updated")
        setEditingAppointment(null)
      } else {
        await axios.post("http://localhost:8007/appointments", dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success("Appointment added")
      }
      await fetchAppointments()
      setFormData({ doctorName: "", specialty: "", appointmentDate: "", location: "", reason: "", notes: "", status: "upcoming" })
      setShowAddForm(false)
    } catch (error) {
      console.error("Save error:", error)
      toast.error(error.response?.data?.message || "Failed to save appointment")
    }
  }

  const handleDeleteAppointment = async (id) => {
    try {
      await axios.delete(`http://localhost:8007/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Appointment deleted")
      fetchAppointments()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.response?.data?.message || "Failed to delete appointment")
    }
  }

  const handleEditAppointment = (appointment) => {
    setFormData({
      doctorName: appointment.doctorName,
      specialty: appointment.specialty || "",
      appointmentDate: new Date(appointment.appointmentDate).toISOString().slice(0, 16),
      location: appointment.location || "",
      reason: appointment.reason || "",
      notes: appointment.notes || "",
      status: appointment.status
    })
    setEditingAppointment(appointment._id)
    setShowAddForm(true)
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400'
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'cancelled': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
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
              <p className="text-purple-400 text-sm font-semibold">Viewing appointments for:</p>
              <p className="text-white text-lg font-bold">{activeMember.name}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {activeMember ? `${activeMember.name}'s Appointments` : "My Appointments"}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Manage doctor appointments</p>
            </div>
            <Button
              onclick={() => setShowAddForm(true)}
              text="+ Add Appointment"
              style="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setSelectedStatus('all')} className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedStatus === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}>All</button>
            <button onClick={() => setSelectedStatus('upcoming')} className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedStatus === 'upcoming' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}>📅 Upcoming</button>
            <button onClick={() => setSelectedStatus('completed')} className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedStatus === 'completed' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}>✅ Completed</button>
            <button onClick={() => setSelectedStatus('cancelled')} className={`px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedStatus === 'cancelled' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}>❌ Cancelled</button>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-gray-400">No appointments scheduled yet.</p>
                <p className="text-gray-500 text-sm mt-2">Click "Add Appointment" to get started</p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white">Dr. {appointment.doctorName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                      {appointment.specialty && (
                        <p className="text-purple-400 font-semibold mb-2 text-sm sm:text-base">{appointment.specialty}</p>
                      )}
                      <p className="text-gray-400 text-sm mb-1">📅 {new Date(appointment.appointmentDate).toLocaleString()}</p>
                      {appointment.location && <p className="text-gray-400 text-sm mb-1">📍 {appointment.location}</p>}
                      {appointment.reason && <p className="text-gray-400 text-sm">Reason: {appointment.reason}</p>}
                    </div>
                    <div className="flex gap-2 self-start">
                      <button onClick={() => handleEditAppointment(appointment)} className="text-blue-400 hover:text-blue-300 px-3 py-1 text-sm">✏️ Edit</button>
                      <button onClick={() => handleDeleteAppointment(appointment._id)} className="text-red-400 hover:text-red-300 px-3 py-1 text-sm">🗑️ Delete</button>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-gray-400 text-sm">Notes</p>
                      <p className="text-white text-sm mt-1">{appointment.notes}</p>
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
                  {editingAppointment ? "Edit Appointment" : "Add New Appointment"}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Doctor Name *</label>
                    <input name="doctorName" type="text" value={formData.doctorName} onChange={handleInputChange} placeholder="e.g., John Smith" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Specialty</label>
                    <input name="specialty" type="text" value={formData.specialty} onChange={handleInputChange} placeholder="e.g., Cardiologist" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Appointment Date & Time *</label>
                    <input name="appointmentDate" type="datetime-local" value={formData.appointmentDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location/Clinic</label>
                    <input name="location" type="text" value={formData.location} onChange={handleInputChange} placeholder="e.g., City Hospital" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Visit</label>
                    <input name="reason" type="text" value={formData.reason} onChange={handleInputChange} placeholder="e.g., Annual checkup" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any additional notes..." rows="3" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button onclick={() => setShowAddForm(false)} text="Cancel" style="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg" />
                  <Button onclick={handleAddAppointment} text={editingAppointment ? "Update Appointment" : "Add Appointment"} style="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Appointments