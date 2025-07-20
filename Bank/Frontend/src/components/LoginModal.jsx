import React, { useState } from "react";
import axios from "axios";
import "../style/Login.css";
import { useNavigate } from "react-router";

const BANK_SERVER_PORT = process.env.REACT_APP_BANK_SERVER_PORT;

const LoginModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const requestOtp = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = { email: email };
      await axios.post(
        `http://localhost:${BANK_SERVER_PORT}/api/auth/login/request-otp`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `http://localhost:${BANK_SERVER_PORT}/api/auth/login/verify-otp`,
        {
          email,
          otp,
        }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onClose();
      navigate("/user/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = () => {
    requestOtp();
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-box">
        <div className="modal-header">
          <h2>SecureBank Login</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="login-content">
          {step === 1 ? (
            <>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button
                  onClick={requestOtp}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

              <div className="security-note">
                <span className="security-icon">🔒</span>
                We'll send a one-time password to your email
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  required
                />
                <div className="otp-meta">
                  Sent to: {email}
                  {resendTimer > 0 ? (
                    <span className="resend-timer">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      className="resend-btn"
                      onClick={resendOtp}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button
                  onClick={verifyOtp}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

              <div className="security-note">
                <span className="security-icon">⚠️</span>
                Never share your OTP with anyone
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
