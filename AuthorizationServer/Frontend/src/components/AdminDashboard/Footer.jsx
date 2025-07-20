import React from "react";

import "../../style/partials.css"

export default function Footer() {
  return (
    <footer className="admin-footer">
      <div className="admin-footer-container">
        <div className="admin-footer-left">
          <p>AuthSecure API v2.3.1</p>
          <p>
            © {new Date().getFullYear()} SecureBank Corp. All rights reserved.
          </p>
        </div>
        <div className="admin-footer-right">
          <p>Last refreshed: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </footer>
  );
}
