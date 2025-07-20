import React, { useState } from "react";
import axios from "axios";
import "../style/UserRegistration.css";

const BANK_SERVER_PORT = process.env.REACT_APP_BANK_SERVER_PORT;

const SignupModal = ({ goLogin, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "male",
    aadhaar: "",
    pan: "",
    address: "",
    salary: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear any previous messages when user edits
    if (status.message) {
      setStatus({ loading: false, message: "", error: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", error: false });

    try {
      const res = await axios.post(
        `http://localhost:${BANK_SERVER_PORT}/api/auth/register-user`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setStatus({
        loading: false,
        message: "User registration successful! Account details sent to email.",
        error: false,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "male",
        pan: "",
        aadhaar: "",
        address: "",
        salary: "",
      });
      goLogin();
    } catch (err) {
      setStatus({
        loading: false,
        message:
          err.response?.data?.message ||
          "Registration failed. Please check your details and try again.",
        error: true,
      });
    }
  };

  return (
    <div className="registration-container">
      <div>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="registration-header">
        <h2>New Customer Registration</h2>
        <p className="form-subtitle">
          Please fill in all required fields to open a new bank account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-grid">
          {/* Personal Information */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>

            <div className="form-group">
              <label htmlFor="fullName">
                Full Legal Name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="As per government ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@domain.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Mobile Number <span className="required">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dob">
                  Date of Birth <span className="required">*</span>
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="pan">
                 Aadhaar Number <span className="required">*</span>
                </label>
                <input
                  id="aadhaar"
                  name="aadhaar"
                  type="text"
                  value={formData.aadhaar}
                  onChange={handleChange}
                  placeholder="123456789325"
                  pattern="[0-9]{12}"
                  title="Enter valid aadhaar no."
                  required
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="form-section">
            <h3 className="section-title">Financial Information</h3>

            <div className="form-group">
              <label htmlFor="pan">
                PAN Number <span className="required">*</span>
              </label>
              <input
                id="pan"
                name="pan"
                type="text"
                value={formData.pan}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Enter valid PAN (e.g., ABCDE1234F)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary">
                Monthly Salary (₹) <span className="required">*</span>
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Approximate monthly income"
                min="0"
                required
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h3 className="section-title">Address Information</h3>

            <div className="form-group">
              <label htmlFor="address">Full Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House no, Street, City, State, PIN"
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="form-footer">
          <div className="security-note">
            <span className="security-icon">🔒</span>
            Your information is protected with 256-bit encryption
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={status.loading}
          >
            {status.loading ? (
              <>
                <span className="spinner"></span>
                Processing Registration...
              </>
            ) : (
              "Register New Customer"
            )}
          </button>

          {status.message && (
            <div
              className={`status-message ${status.error ? "error" : "success"}`}
            >
              {status.message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SignupModal;
