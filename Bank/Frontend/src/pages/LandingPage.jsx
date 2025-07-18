import React, { useState } from "react";
import SignupModal from "../components/SignupModal";
import LoginModal from "../components/LoginModal";
import "../style/LandingPage.css";

import logo from "../images/logo.png";

const LandingPage = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="landing-page">
      {/* Security Header */}
      <div className="security-alert">
        <div className="container">
          <span className="secure-icon">🔒</span>
          <span>
            SecureBank uses industry-standard encryption to protect your data
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="landing-header">
        <div className="container header-content">
          <div className="logo-block">
            <div className="logo-img-block">
             <img className="logo-img" src={logo} alt="" />
            </div>
            <div className="logo-container">
              <div className="logo">SecureBank</div>
              <div className="logo-tagline">Trusted since 1896</div>
            </div>
          </div>

          <nav className="nav-links">
            <button
              className="nav-link login-btn"
              onClick={() => setShowLogin(true)}
            >
              Online Banking Login
            </button>
            <button
              className="nav-link register-btn"
              onClick={() => setShowSignup(true)}
            >
              Register
            </button>
            <button className="nav-link admin-portal">Admin Portal</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Banking with Confidence</h1>
            <p className="hero-subtitle">
              Secure, reliable digital banking with 128-bit encryption and
              real-time fraud monitoring
            </p>
            <div className="hero-ctas">
              <button
                className="cta-primary"
                onClick={() => setShowSignup(true)}
              >
                Open an Account
              </button>
              <button
                className="cta-secondary"
                onClick={() => setShowLogin(true)}
              >
                Existing Customer Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose SecureBank?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Military-Grade Security</h3>
              <p>Multi-factor authentication and biometric login options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Digital Banking</h3>
              <p>Full-service banking from your mobile device or computer</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Data Protection</h3>
              <p>GDPR-compliant data handling with end-to-end encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-content">
          <div className="footer-logo">SecureBank</div>
          <div className="footer-links">
            <a href="#security">Security</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-disclaimer">
            <p>
              © {new Date().getFullYear()} SecureBank PLC. Authorised by the
              Prudential Regulation Authority and regulated by the Financial
              Conduct Authority and the Prudential Regulation Authority.
            </p>
            <p>
              Registered in England. Registered No. 123456. Registered Office: 1
              Churchill Place, London E14 5HP
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showSignup && (
        <SignupModal
          goLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onClose={() => {
            setShowSignup(false);
          }}
        />
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default LandingPage;
