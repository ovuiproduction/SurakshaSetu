import React from "react";
import { Link } from "react-router-dom";
import "../style/AdminDashboard.css";

const AdminDashboard = () => {
  const dashboardCards = [
    {
      title: "Audit Logs",
      description: "Perform security audits on vendor access logs",
      icon: "🔍",
      path: "/admin/log-audit"
    },
    {
      title: "Audit Reports",
      description: "View previously generated compliance reports",
      icon: "📋",
      path: "/admin/audit-reports"
    },
    {
      title: "System Monitoring",
      description: "Real-time system activity dashboard",
      icon: "📊",
      path: "/admin/system-monitoring"
    },
    {
      title: "Compliance",
      description: "GDPR/DPDP compliance tools",
      icon: "⚖️",
      path: "/admin/compliance"
    }, 
    {
      title: "Vendor Management",
      description: "Manage third-party vendor permissions",
      icon: "🏛️",
      path: "/admin/vendors"
    },
     {
      title: "User Access",
      description: "Manage administrator permissions",
      icon: "👤",
      path: "/admin/user-access"
    },
  ];

  return (
     <div className="main_admin-dashboard">
      <div className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Security Administration</h1>
        <p className="admin-dashboard__subtitle">
          Last accessed: {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="admin-dashboard__content">
        <div className="admin-dashboard__card-grid">
          {dashboardCards.map((card, index) => (
            <Link
              to={card.path}
              key={index}
              className="admin-dashboard__card"
            >
              <div className="admin-dashboard__card-icon">{card.icon}</div>
              <div className="admin-dashboard__card-text">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="admin-dashboard__card-badge">→</div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="admin-dashboard__footer">
        <div>
          © {new Date().getFullYear()} Security Administration Portal | 
          <a href="/privacy">Privacy Policy</a> | 
          <a href="/terms">Terms of Service</a>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          System Version: 2.4.1 | Last Updated: {new Date().getFullYear()}-{(new Date().getMonth()+1).toString().padStart(2, '0')}-{new Date().getDate().toString().padStart(2, '0')}
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;