import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Register.css";

const AUTH_SERVER_PORT = process.env.REACT_APP_AUTH_SERVER_PORT;

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    orgName: "",
    email: "",
    phone: "",
    contactPerson: "",
    purpose: "",
    dataFields: [],
    callbackUrl: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const newFields = checked
        ? [...formData.dataFields, value]
        : formData.dataFields.filter((f) => f !== value);
      setFormData({ ...formData, dataFields: newFields });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:${AUTH_SERVER_PORT}/api/register`,
        formData
      );
      alert("Vendor registered successfully! Go to login.");
      navigate("/login");
    } catch (err) {
      alert("Registration failed. Try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <div className="logo-placeholder">AuthSecure</div>
        <nav className="register-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>

      <div className="register-container">
        <div className="register-card">
          <h2>Vendor Registration</h2>
          <p className="form-subtitle">
            Complete this form to request API access
          </p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                name="orgName"
                placeholder="Your company name"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Official Email</label>
              <input
                type="email"
                name="email"
                placeholder="contact@yourcompany.com"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+91-1234567890"
                pattern="\+[0-9]{1,2}-[0-9]{10}"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                placeholder="Full name"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Purpose of Data Access</label>
              <input
                type="text"
                name="purpose"
                placeholder="Describe your use case"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Callback URL</label>
              <input
                type="url"
                name="callbackUrl"
                placeholder="https://yourdomain.com/callback"
                required
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">Requested Data Fields</label>
              <div className="checkboxes">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="kyc-name"
                    name="dataFields"
                    value="kyc:name"
                    onChange={handleChange}
                  />
                  <label htmlFor="kyc-name">Full Name</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="kyc-dob"
                    name="dataFields"
                    value="kyc:dob"
                    onChange={handleChange}
                  />
                  <label htmlFor="kyc-dob">Date of Birth</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="kyc-pan"
                    name="dataFields"
                    value="kyc:pan"
                    onChange={handleChange}
                  />
                  <label htmlFor="kyc-pan">PAN Number</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="kyc-aadhaar"
                    name="dataFields"
                    value="kyc:aadhaar"
                    onChange={handleChange}
                  />
                  <label htmlFor="kyc-pan">Aadhaar Number</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="kyc-gender"
                    name="dataFields"
                    value="kyc:gender"
                    onChange={handleChange}
                  />
                  <label htmlFor="kyc-pan">Gender</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="kyc-address"
                    name="dataFields"
                    value="kyc:address"
                    onChange={handleChange}
                  />
                  <label htmlFor="kyc-pan">Address</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="contact-email"
                    name="dataFields"
                    value="contact:email"
                    onChange={handleChange}
                  />
                  <label htmlFor="contact-email">Email Address</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="contact-phone"
                    name="dataFields"
                    value="contact:phone"
                    onChange={handleChange}
                  />
                  <label htmlFor="contact-email">Phone</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="account-accountNumber"
                    name="dataFields"
                    value="account:accountNumber"
                    onChange={handleChange}
                  />
                  <label htmlFor="account-type">Account Number</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="account-salary"
                    name="dataFields"
                    value="account:salary"
                    onChange={handleChange}
                  />
                  <label htmlFor="account-type">Salary</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="account-bankBalance"
                    name="dataFields"
                    value="account:bankBalance"
                    onChange={handleChange}
                  />
                  <label htmlFor="account-balance">Account Balance</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="transactions-history"
                    name="dataFields"
                    value="transactions:transactions"
                    onChange={handleChange}
                  />
                  <label htmlFor="transactions-history">
                    Transaction History
                  </label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="consent-timestamp"
                    name="dataFields"
                    value="consent:timestamp"
                    onChange={handleChange}
                  />
                  <label htmlFor="consent-timestamp">Consent Metadata</label>
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Submit Registration
            </button>
          </form>

          <div className="login-link">
            Already registered? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>

      <footer className="register-footer">
        <p>© {new Date().getFullYear()} AuthSecure. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/security">Security</Link>
        </div>
      </footer>
    </div>
  );
};

export default Register;
