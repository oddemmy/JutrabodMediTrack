import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      await axios.post("https://jutrabod-backend.onrender.com", { email });
      setStatus("sent");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 border border-gray-700">

        {status === "sent" ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p className="text-gray-400 mt-2">
              If that email exists, a password reset link has been sent. Check your inbox.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-purple-500/50"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-400">Enter your email and we'll send you a reset link.</p>
            </div>

            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
              >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>

              <p
                onClick={() => navigate("/login")}
                className="text-center text-gray-400 cursor-pointer hover:text-gray-300 transition text-sm"
              >
                Back to Login
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;