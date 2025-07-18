import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";

const AUTH_SERVER_PORT =  process.env.REACT_APP_AUTH_SERVER_PORT;


const Login = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    try {
      const res = await axios.post(`http://localhost:${AUTH_SERVER_PORT}/api/request-otp`, { email });
      alert("OTP sent to your email.");
      setOtpSent(true);
    } catch (err) {
      setError("Vendor not found or server error.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`http://localhost:${AUTH_SERVER_PORT}/api/verify-otp`, { email, otp });
      const vendorData = res.data.vendor;
      localStorage.setItem("vendor", JSON.stringify(vendorData));
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid or expired OTP.");
    }
  };

  return (
    <div className="login-container">
      <h2>Vendor Login</h2>

      <div className="login-form">
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {!otpSent ? (
          <button onClick={handleRequestOtp}>Request OTP</button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button onClick={handleVerifyOtp}>Verify OTP</button>
          </>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
