import React, { useEffect, useState } from "react";
import { fetchAllVendors, fetchLogsByVendor } from "../api/adminApi";
import VendorSelector from "../components/AdminDashboard/VendorSelector";
import LogViewer from "../components/AdminDashboard/LogViewer";
import "../style/AdminDashboard.css";

const AdminDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    const getVendors = async () => {
      try {
        const data = await fetchAllVendors();
        setVendors(data.vendors);
      } catch (err) {
        console.error("Error fetching vendors", err);
      }
    };
    getVendors();
  }, []);

  useEffect(() => {
    const getLogs = async () => {
      if (!selectedVendor) return;
      setLoadingLogs(true);
      try {
        const data = await fetchLogsByVendor(selectedVendor);
        setLogs(data.logs);
      } catch (err) {
        console.error("Error fetching logs", err);
      } finally {
        setLoadingLogs(false);
      }
    };
    getLogs();
  }, [selectedVendor]);

  const filteredLogs = userIdFilter
    ? logs.filter(log => 
        log.userId && log.userId.toLowerCase().includes(userIdFilter.toLowerCase())
      )
    : logs;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
      </div>
      
      <div className="filters-container">
        <div className="vendor-selector-container">
          <VendorSelector
            vendors={vendors}
            selectedVendor={selectedVendor}
            onChange={setSelectedVendor}
          />
        </div>
        
        <div className="user-filter-container">
          <label>Filter by User ID:</label>
          <input
            type="text"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Enter user ID"
            className="filter-input"
            disabled={!selectedVendor}
          />
        </div>
      </div>

      {loadingLogs ? (
        <p className="loading-logs">Loading logs...</p>
      ) : (
        <div className="log-viewer-container">
          <LogViewer 
            logs={filteredLogs} 
            userIdFilter={userIdFilter}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;