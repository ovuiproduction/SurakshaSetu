import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

export default function Header({ vendor }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("vendor");
    navigate("/");
  };

  return (
    <header className="dashboard-header">
      <div className="header-container">
        <div className="branding">
          <div className="bank-logo">
            <img className="logo-img" src={logo} alt="" />
          </div>
          <h1>AuthSecure</h1>
          <span className="product-tag">Vendor Portal</span>
        </div>
        <div className="user-actions">
          <span className="welcome-msg">Welcome, {vendor.orgName}</span>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="icon-logout"></i> Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
