import React from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import {useNavigate} from "react-router-dom"
import { useState } from 'react'
import axios from "axios"
import {toast} from "react-toastify" 

const Login = () => {
  const navigate = useNavigate()
const [userDetail, setUserDetail] = useState({
  email: "",
  password: ""
})
const [loading, setLoading] = useState(false)
const handleInputChange = (e) => {
  const name = e.target.name
  const value = e.target.value
  setUserDetail({...userDetail, [name]: value})
}
const handleLogin = () => {
  // Validation
  if (!userDetail.email || !userDetail.password) {
    toast.error("Please fill in all fields")
    return
  }

  setLoading(true)
  axios.post("http://localhost:8007/user/login", userDetail)
    .then((res) => {
  console.log(res)
  
  // Save token to localStorage
  localStorage.setItem("token", res.data.token)
  
  // Optionally save user info too
  if (res.data.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user))
  }
  
  toast.success(res.data?.message)
  navigate("/dashboard")
})
    .catch((err) => {
      console.log(err)
      let errormessage = err?.response?.data?.message
      toast.error(errormessage)
    })
    .finally(() => setLoading(false))
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Log in to continue to your dashboard</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          
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
              placeholder="Enter your password"
              change={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            {/* Forgot Password Link */}
            <p
              onClick={() => navigate("/forgot-password")}
              className="text-right text-sm text-purple-400 hover:text-purple-300 cursor-pointer mt-2 transition"
            >
              Forgot Password?
            </p>
          </div>
          {/* Login Button */}
          <Button
          onclick={handleLogin}
            text={loading ? "Logging in..." : "Login"} 
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
        onclick={() => window.location.href = "http://localhost:8007/user/auth/google"}
        style="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white font-semibold py-3 rounded-lg transition duration-300"
      />
        {/* Link */}
        <p className="text-center mt-8 text-gray-400">
          Don't have an account?{' '}
        <span 
          onClick={() => navigate("/signup")} 
          className="text-purple-400 font-semibold hover:text-purple-300 transition cursor-pointer"
          >
          Create Account
        </span>
        </p>

      </div>
    </div>
  )
}

export default Login