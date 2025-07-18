import React from "react";

export default function Footer() {
  return (
    <footer className="dashboard-footer">
      <div className="footer-container">
        <div className="footer-left">
          <p>AuthSecure API v2.3.1</p>
          <p>
            © {new Date().getFullYear()} SecureBank Corp. All rights reserved.
          </p>
        </div>
        <div className="footer-right">
          <p>Last refreshed: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </footer>
  );
}
