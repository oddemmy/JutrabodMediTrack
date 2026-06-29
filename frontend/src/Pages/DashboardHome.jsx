import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { toast } from 'react-toastify'
import { requestNotificationPermission } from '../firebase'
import { onMessageListener } from '../firebase'

const DashboardHome = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalMedications: 0,
    todayMedications: 0,
    totalMetrics: 0,
    recentMetrics: []
  })
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || '{}')

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }
    fetchDashboardData()
  }, [token, navigate])

  // Request notification permission
useEffect(() => {
  const setupNotifications = async () => {
    const token = await requestNotificationPermission()
    if (token) {
      console.log('FCM Token:', token)
      localStorage.setItem('fcmToken', token)
      
      // Save token to backend
      try {
        await axiosInstance.post(
          "/user-token",
          { fcmToken: token },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        )
        console.log('FCM token saved to backend')
      } catch (error) {
        console.error('Failed to save FCM token:', error)
      }
    }
  }
  
  setupNotifications()
}, [])

// Listen for foreground notifications
useEffect(() => {
  onMessageListener()
    .then((payload) => {
      console.log('Received foreground message:', payload)
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: payload.data
        })
      }
      
      // Show toast notification in app
      toast.info(`💊 ${payload.notification.body}`)
    })
    .catch((err) => console.log('Failed to receive message:', err))
}, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch medications
      const medsResponse = await axiosInstance.get("/medications", {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Fetch health metrics
      const metricsResponse = await axiosInstance.get("/health-metrics", {
        headers: { Authorization: `Bearer ${token}` }
      })

      const medications = medsResponse.data.medications || []
      const metrics = metricsResponse.data.metrics || []

      setStats({
        totalMedications: medications.length,
        todayMedications: medications.filter(med => med.isActive).length,
        totalMetrics: metrics.length,
        recentMetrics: metrics.slice(0, 3) // Get last 3 metrics
      })

      setLoading(false)
    } catch (error) {
      console.log(error)
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        toast.error("Failed to fetch dashboard data")
      }
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.username || 'User'}!
        </h1>
        <p className="text-gray-400">Here's your health overview for today</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total Medications */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💊</span>
            <span className="text-purple-400 text-sm font-semibold">TOTAL</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats.totalMedications}</h3>
          <p className="text-gray-400 text-sm">Medications</p>
        </div>

        {/* Card 2: Active Medications */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">✅</span>
            <span className="text-green-400 text-sm font-semibold">ACTIVE</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats.todayMedications}</h3>
          <p className="text-gray-400 text-sm">Active Meds</p>
        </div>

        {/* Card 3: Health Metrics */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📊</span>
            <span className="text-blue-400 text-sm font-semibold">TRACKED</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats.totalMetrics}</h3>
          <p className="text-gray-400 text-sm">Measurements</p>
        </div>

        {/* Card 4: Quick Action */}
        <div 
          onClick={() => navigate('/dashboard/medications')}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 cursor-pointer hover:opacity-90 transition"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">➕</span>
            <span className="text-white text-sm font-semibold">ACTION</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Add Medication</h3>
          <p className="text-white text-sm opacity-80">Click to add new</p>
        </div>
      </div>

      {/* Recent Health Metrics */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Recent Measurements</h2>
          <button 
            onClick={() => navigate('/dashboard/health-metrics')}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            View All →
          </button>
        </div>
        
        {stats.recentMetrics.length === 0 ? (
          <p className="text-gray-400">No measurements recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentMetrics.map((metric) => (
              <div key={metric._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMetricIcon(metric.metricType)}</span>
                  <div>
                    <p className="text-white font-medium">{getMetricLabel(metric.metricType)}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(metric.measuredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-purple-400 font-semibold">
                  {metric.value} {metric.unit}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardHome