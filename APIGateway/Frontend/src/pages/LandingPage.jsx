import React from "react";
import { Link } from "react-router-dom";
import "../style/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-header">
        <div className="logo-placeholder">GateWay</div>
        <nav className="landing-nav">
          <Link to="/about">About</Link>
          <Link to="/docs">Documentation</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      
      <div className="landing-content">
        <div className="landing-hero">
          <h1>Welcome to AuthSecure</h1>
          <p className="subtitle">Enterprise-grade Authorization Server for Financial Platforms</p>
          
          <div className="landing-buttons">
            <Link to="/register">
              <button className="btn-primary">Register as User</button>
            </Link>
            <Link to="/login">
              <button className="btn-secondary">Login to Dashboard</button>
            </Link>
          </div>
          
        </div>
        
        <div className="features-section">
          <h2>Secure API Authorization Platform</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure API Tokens</h3>
              <p>Industry-standard OAuth 2.0 tokens with strict expiration policies</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>User Consent</h3>
              <p>Granular consent management with audit trails</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Access Control</h3>
              <p>Role-based permissions with attribute-based conditions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Compliance Ready</h3>
              <p>Built-in support for financial regulations and standards</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="landing-footer">
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

export default LandingPage;