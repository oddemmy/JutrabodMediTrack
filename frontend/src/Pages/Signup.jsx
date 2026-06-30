import React from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import {useNavigate} from "react-router-dom"
import { useState } from 'react'
import axiosInstance from "../api/axiosInstance"
import {toast} from "react-toastify"

const Signup = () => {
  const navigate = useNavigate()
  const [userDetail, setUserDetail] = useState({
    username: "",
    email: "",
    password: ""
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const handleInputChange = (e) => {
    console.log(e.target.name, e.target.value);
    const name = e.target.name
    const value = e.target.value
    if (name === "confirmPassword") {
      setConfirmPassword(value)
    } else {
      setUserDetail({...userDetail, [name]: value})
    }
  }
  const Register = () => {
     if (userDetail.password !== confirmPassword) {
    toast.error("Passwords do not match!")
    return
  }
  
  // Check if all fields are filled
  if (!userDetail.username || !userDetail.email || !userDetail.password) {
    toast.error("Please fill in all fields")
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(userDetail.email)) {
  toast.error("Please enter a valid email address")
  return
}
    setLoading(true)
    axiosInstance.post("/user/signup", userDetail)

    .then((res) => {
      console.log(res);
      setRegisteredEmail(userDetail.email)
      setEmailSent(true)
      toast.success(res.data?.message)
    }).catch((err) => {
      console.log(err);
      let errormessage = err?.response?.data?.message || err.message || "Failed to connect to server"
      toast.error(errormessage)
    }).finally(() =>
      setLoading(false)
    )
  }
  // Show email confirmation screen after successful signup
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8">
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-gray-700 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-3xl font-bold text-white mb-3">Check Your Email</h1>
          <p className="text-gray-400 mb-2">
            We sent a verification link to:
          </p>
          <p className="text-purple-400 font-semibold text-lg mb-6">{registeredEmail}</p>
          <p className="text-gray-500 text-sm mb-8">
            Click the link in the email to verify your account before logging in.
            The link expires in 24 hours.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-purple-500/50"
          >
            Go to Login
          </button>
          <p className="text-gray-600 text-xs mt-4">Didn't receive it? Check your spam folder.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join Us</h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <Input
              name="username"
              type="text"
              change={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <Input
              name="email"
              type="email"
              change={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <Input
              name="password"
              type="password"
              change={handleInputChange}
              placeholder="Create a password"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <Input
              name="confirmPassword"
              type="password"
              change={handleInputChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Submit Button */}
          <Button
            onclick={Register}
            
            text={loading ? "Creating Account..." : "Create Account"}
            disabled={loading}
            style="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-purple-500/50 mt-6"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {/* Social Login */}
        <Button
          text="Continue with Google"
          onclick={() => window.location.href = `${import.meta.env.VITE_API_URL || "https://jutrabodmeditrack.onrender.com"}/user/auth/google`}
          style="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-semibold py-3 rounded-lg transition duration-300"
        />

        {/* Sign In Link */}
        <p className="text-center mt-8 text-gray-400">
          Already have an account?{' '}
        <span 
       onClick={() => navigate("/login")} 
        className="text-purple-400 font-semibold hover:text-purple-300 transition cursor-pointer"
        >
        Sign In
        </span>
        </p>
      </div>
    </div>
  )
}

export default Signup
