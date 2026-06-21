import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get("token");
   axios.get(`https://jutrabod-backend.onrender.com/user/verify-email?token=${token}`)

      .then(res => setStatus("success"))
      .catch(err => setStatus("error"));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      
      {status === "verifying" && (
        <>
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-semibold text-gray-700">Verifying your email...</h2>
          <p className="text-gray-500 mt-2">Please wait a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
          <p className="text-gray-600 mt-2">Your Jutrabod account has been verified successfully.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
          >
            Go to Login
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-500">Verification Failed</h2>
          <p className="text-gray-600 mt-2">The link is invalid or has expired. Please sign up again.</p>
          <button
            onClick={() => navigate("/signup")}
            className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
          >
            Back to Signup
          </button>
        </>
      )}

    </div>
  );
};

export default VerifyEmail;