import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get("token")
    const username = searchParams.get("username")
    const id = searchParams.get("id")
    const email = searchParams.get("email")

    if (token) {
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify({ id, username, email }))
      navigate("/dashboard")
    } else {
      navigate("/login")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <p className="text-white text-xl">Signing you in...</p>
    </div>
  )
}

export default OAuthSuccess