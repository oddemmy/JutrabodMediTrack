import axios from "axios"

// Single source of truth for the backend URL.
// In production (Render static site), set VITE_API_URL in Render's environment variables.
// In local dev, create a frontend/.env file with: VITE_API_URL=http://localhost:8007
const BASE_URL = import.meta.env.VITE_API_URL || "https://jutrabodmeditrack.onrender.com"

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

export default axiosInstance
