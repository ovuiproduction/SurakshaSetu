import React from "react";

import logo from "../images/logo.png";

export default function Header({ vendor }) {
  const handleLogout = () => {
    localStorage.removeItem("vendor");
    navigate("/login");
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
