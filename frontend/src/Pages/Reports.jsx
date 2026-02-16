import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Reports = () => {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState([])
  const [selectedMetric, setSelectedMetric] = useState('blood_pressure')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }
    fetchMetrics()
  }, [token, navigate, selectedMetric])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `http://localhost:8007/health-metrics?metricType=${selectedMetric}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setMetrics(response.data.metrics || [])
      setLoading(false)
    } catch (error) {
      console.log(error)
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch metrics")
      }
      setLoading(false)
    }
  }

  // Prepare chart data
  const getChartData = () => {
    if (metrics.length === 0) return null

    const sortedMetrics = [...metrics].sort((a, b) => 
      new Date(a.measuredAt) - new Date(b.measuredAt)
    )

    const labels = sortedMetrics.map(m => 
      new Date(m.measuredAt).toLocaleDateString()
    )

    let values = []
    
    if (selectedMetric === 'blood_pressure') {
      // Extract systolic values (first number in BP reading like "120/80")
      values = sortedMetrics.map(m => {
        const systolic = m.value.split('/')[0]
        return parseInt(systolic) || 0
      })
    } else {
      values = sortedMetrics.map(m => parseFloat(m.value) || 0)
    }

    return {
      labels,
      datasets: [
        {
          label: getMetricLabel(selectedMetric),
          data: values,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.3
        }
      ]
    }
  }

  const getMetricLabel = (type) => {
    switch(type) {
      case 'blood_pressure': return 'Blood Pressure (Systolic)'
      case 'blood_sugar': return 'Blood Sugar'
      case 'weight': return 'Weight'
      default: return type
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff'
        }
      },
      title: {
        display: true,
        text: `${getMetricLabel(selectedMetric)} Over Time`,
        color: '#fff',
        font: {
          size: 18
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: '#374151'
        }
      },
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: '#374151'
        }
      }
    }
  }

  const chartData = getChartData()

  // Calculate stats
  const getStats = () => {
    if (metrics.length === 0) return null

    let values = []
    if (selectedMetric === 'blood_pressure') {
      values = metrics.map(m => {
        const systolic = m.value.split('/')[0]
        return parseInt(systolic) || 0
      })
    } else {
      values = metrics.map(m => parseFloat(m.value) || 0)
    }

    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const latest = values[values.length - 1]

    return { avg, max, min, latest, count: metrics.length }
  }

  const stats = getStats()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Health Reports</h1>
        <p className="text-gray-400">Visualize your health metrics over time</p>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedMetric('blood_pressure')}
          className={`px-4 py-2 rounded-lg ${selectedMetric === 'blood_pressure' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          ❤️ Blood Pressure
        </button>
        <button
          onClick={() => setSelectedMetric('blood_sugar')}
          className={`px-4 py-2 rounded-lg ${selectedMetric === 'blood_sugar' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          🩸 Blood Sugar
        </button>
        <button
          onClick={() => setSelectedMetric('weight')}
          className={`px-4 py-2 rounded-lg ${selectedMetric === 'weight' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          ⚖️ Weight
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-white text-xl">Loading...</p>
        </div>
      ) : metrics.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <p className="text-gray-400">No data available for {getMetricLabel(selectedMetric)}</p>
          <p className="text-gray-500 text-sm mt-2">Add measurements in Health Metrics to see charts</p>
          <button 
            onClick={() => navigate('/dashboard/health-metrics')}
            className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
          >
            Go to Health Metrics
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Latest</p>
                <p className="text-white text-2xl font-bold">{stats.latest}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Average</p>
                <p className="text-white text-2xl font-bold">{stats.avg}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Highest</p>
                <p className="text-white text-2xl font-bold">{stats.max}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Lowest</p>
                <p className="text-white text-2xl font-bold">{stats.min}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Records</p>
                <p className="text-white text-2xl font-bold">{stats.count}</p>
              </div>
            </div>
          )}

          {/* Line Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <div style={{ height: '400px' }}>
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div style={{ height: '400px' }}>
              {chartData && <Bar data={chartData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: `${getMetricLabel(selectedMetric)} - Bar View`}}}} />}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports