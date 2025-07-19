import React from "react";
import { Link } from "react-router-dom";
import "../style/MainAdminDashboard.css";

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
      title: "Vendor Management",
      description: "Manage third-party vendor permissions",
      icon: "🏛️",
      path: "/admin/vendors"
    },
    {
      title: "System Monitoring",
      description: "Real-time system activity dashboard",
      icon: "📊",
      path: "/admin/system-monitoring"
    },
    {
      title: "User Access",
      description: "Manage administrator permissions",
      icon: "👤",
      path: "/admin/user-access"
    },
    {
      title: "Compliance",
      description: "GDPR/DPDP compliance tools",
      icon: "⚖️",
      path: "/admin/compliance"
    }
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
    </div>
  );
};

export default AdminDashboard;