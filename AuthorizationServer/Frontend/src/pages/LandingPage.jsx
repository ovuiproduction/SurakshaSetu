import React from "react";
import { Link } from "react-router-dom";
import "../style/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <div className="landing-page-header">
        <div className="landing-page-logo">AuthSecure</div>
        <nav className="landing-page-nav">
          <Link to="/about">About</Link>
          <Link to="/docs">Documentation</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin/dashboard">Admin</Link>
        </nav>
      </div>
      
      <div className="landing-page-content">
        <div className="landing-page-hero">
          <h1>Welcome to AuthSecure</h1>
          <p className="landing-page-subtitle">Enterprise-grade Authorization Server for Financial Platforms</p>
          
          <div className="landing-page-buttons">
            <Link to="/register">
              <button className="landing-page-btn-primary">Register as Partner</button>
            </Link>
            <Link to="/login">
              <button className="landing-page-btn-secondary">Login to Dashboard</button>
            </Link>
          </div>
        </div>
        
        <div className="landing-page-features">
          <h2>Secure API Authorization Platform</h2>
          <div className="landing-page-features-grid">
            <div className="landing-page-feature-card">
              <div className="landing-page-feature-icon">🔒</div>
              <h3>Secure API Tokens</h3>
              <p>Industry-standard OAuth 2.0 tokens with strict expiration policies</p>
            </div>
            <div className="landing-page-feature-card">
              <div className="landing-page-feature-icon">👥</div>
              <h3>User Consent</h3>
              <p>Granular consent management with audit trails</p>
            </div>
            <div className="landing-page-feature-card">
              <div className="landing-page-feature-icon">🛡️</div>
              <h3>Access Control</h3>
              <p>Role-based permissions with attribute-based conditions</p>
            </div>
            <div className="landing-page-feature-card">
              <div className="landing-page-feature-icon">📝</div>
              <h3>Compliance Ready</h3>
              <p>Built-in support for financial regulations and standards</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="landing-page-footer">
        <p>© {new Date().getFullYear()} AuthSecure. All rights reserved.</p>
        <div className="landing-page-footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/security">Security</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;