import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Signup from './Pages/Signup'
import { ToastContainer } from 'react-toastify'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import DashboardHome from './Pages/DashboardHome'
import Medications from './Pages/Medications'
import HealthMetrics from './Pages/HealthMetrics'
import Appointments from './Pages/Appointments'
import Reports from './Pages/Reports'
import TodaySchedule from './Pages/TodaySchedule'
import Symptoms from './Pages/Symptoms'
import DrugInteractions from './Pages/DrugInteractions'
import FamilyMembers from './Pages/FamilyMembers'
import VerifyEmail from './Pages/VerifyEmail'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPassword'
import OAuthSuccess from './Pages/OAuthSuccess'


function App() {
  
  return (
    <>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/oauth-success' element={<OAuthSuccess />} />
        
        {/* Dashboard with nested routes */}
        <Route path='/dashboard' element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path='today' element={<TodaySchedule />} />
          <Route path='medications' element={<Medications />} />
          <Route path='health-metrics' element={<HealthMetrics />} />
          <Route path='appointments' element={<Appointments />} />
          <Route path='symptoms' element={<Symptoms />} />
          <Route path='reports' element={<Reports />} />
          <Route path='interactions' element={<DrugInteractions />} />  
          <Route path='family' element={<FamilyMembers />} />
          
        </Route>
      </Routes>
      <ToastContainer />
    </>
  )
}

export default App