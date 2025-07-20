import React, { useEffect, useState } from "react";
import {
  fetchAllVendors,
  fetchLogsByVendor,
  fetchAllUsers,
} from "../../api/adminApi";
import { VendorSelector, UserSelector } from "./Selectors";
import LogsAudit from "./LogsAudit";
import "../../style/LogsAuditConsole.css";
import { Link } from "react-router-dom";

const LogsAuditConsole = () => {
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedVendorObj, setSelectedVendorObj] = useState("");

  useEffect(() => {
    if (selectedVendor) {
      let selectedVendorObject = vendors.find(
        (v) => v.clientId === selectedVendor
      );
      setSelectedVendorObj(selectedVendorObject);
    }
  }, [selectedVendor]);

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
    const getUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data.users);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    getUsers();
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

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setUserIdFilter(userId);
  };

  const filteredLogs = userIdFilter
    ? logs.filter(
        (log) =>
          log.userId &&
          log.userId.toLowerCase().includes(userIdFilter.toLowerCase())
      )
    : logs;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Log Audit Console</h2>
        <div className="header-info">
          <span className="info-item">
            <strong>Vendors:</strong> {vendors.length}
          </span>
          <span className="info-item">
            <strong>Users:</strong> {users.length}
          </span>
        </div>
        <Link to="/admin/dashboard" className="back-link">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="dashboard-content">
        <div className="control-panel">
          <div className="control-section">
            <h3 className="section-title">Filters</h3>
            <div className="filter-group">
              <VendorSelector
                vendors={vendors}
                selectedVendor={selectedVendor}
                onChange={setSelectedVendor}
              />
            </div>
            <div className="filter-group">
              <UserSelector
                users={users}
                selectedUser={selectedUser}
                onChange={handleUserSelect}
              />
            </div>
            {selectedUser && (
              <button
                className="clear-filter-btn"
                onClick={() => {
                  setSelectedUser("");
                  setUserIdFilter("");
                }}
              >
                Clear User Filter
              </button>
            )}
          </div>

        </div>

        <div className="log-display">
          {loadingLogs ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading transaction logs...</p>
            </div>
          ) : (
            <LogsAudit
              logs={filteredLogs}
              userIdFilter={userIdFilter}
              selectedVendorId={selectedVendor}
              selectedVendorObj={selectedVendorObj}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsAuditConsole;
