import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("activeFamilyMember")
    navigate("/login")
  }

  const handleNavigation = (path) => {
    navigate(path)
    setIsSidebarOpen(false) // Close sidebar on mobile after navigation
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static
        inset-y-0 left-0
        w-64 bg-gray-800 border-r border-gray-700
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        z-50
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Close Button */}
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">💊 Jutrabod</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => handleNavigation('/dashboard/today')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>📅</span>
            <span>Today's Schedule</span>
          </button>

          <button 
            onClick={() => handleNavigation('/dashboard/medications')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>💊</span>
            <span>Medications</span>
          </button>

          <button 
            onClick={() => handleNavigation('/dashboard/health-metrics')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>📊</span>
            <span>Health Metrics</span>
          </button>

          <button 
            onClick={() => handleNavigation('/dashboard/appointments')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>🏥</span>
            <span>Appointments</span>
          </button>

          <button 
            onClick={() => handleNavigation('/dashboard/symptoms')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>🤒</span>
            <span>Symptoms</span>
          </button>

          <button 
            onClick={() => handleNavigation('/dashboard/reports')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>📈</span>
            <span>Reports</span>
          </button>

          <button 
            onClick={() => handleNavigation('/dashboard/interactions')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>⚠️</span>
            <span>Drug Interactions</span>
          </button>

          <button 
            onClick={() => handleNavigation('/dashboard/family')}
            className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition flex items-center gap-3"
          >
            <span>👨‍👩‍👧‍👦</span>
            <span>Family</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white text-2xl"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold text-white">💊 Jutrabod</h1>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard