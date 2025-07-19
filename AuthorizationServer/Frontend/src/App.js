// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LogsAuditConsole from "./components/AdminDashboard/LogsAuditConsole";
import AuditReportsConsole from "./components/AdminDashboard/AuditReportsConsole";
// import ComplianceConsole from "./components/AdminDashboard/ComplianceConsole";
import SystemMonitorConsole from "./components/AdminDashboard/SystemMonitorConsole";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/log-audit" element={<LogsAuditConsole />} />
        <Route path="/admin/audit-reports" element={<AuditReportsConsole />} />
        {/* <Route path="/admin/compliance" element={<ComplianceConsole />} /> */}
        <Route
          path="/admin/system-monitoring"
          element={<SystemMonitorConsole />}
        />
      </Routes>
    </Router>
  );
}

export default App;
