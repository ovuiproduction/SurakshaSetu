import React, { useState, useEffect } from "react";
import {
  fetchAuthServerLogs,
  fetchGatewayServerLogs,
} from "../../api/adminApi";
import "../../style/SystemMonitorConsole.css";
import SystemLogView from "./SystemLogView";
import { Link } from "react-router-dom";

const DateRangeSelector = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStartDateChange = (e) => {
    const date = e.target.value;
    setStartDate(date);
    onDateChange({ start: date, end: endDate });
  };

  const handleEndDateChange = (e) => {
    const date = e.target.value;
    setEndDate(date);
    onDateChange({ start: startDate, end: date });
  };

  return (
    <div className="custom-date-range">
      <div className="date-input-group">
        <label htmlFor="start-date">From:</label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={handleStartDateChange}
          max={endDate || undefined}
          className="date-input"
        />
      </div>
      <div className="date-input-group">
        <label htmlFor="end-date">To:</label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={handleEndDateChange}
          min={startDate || undefined}
          className="date-input"
        />
      </div>
    </div>
  );
};

const SystemMonitorConsole = () => {
  const [authLogs, setAuthLogs] = useState([]);
  const [gatewaylogs, setGatewayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverType, setServerType] = useState("auth");
  const [requestType, setRequestType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  useEffect(() => {
    if (authLogs && authLogs.length == 0) {
      fetchAuthLogs();
    }
    if (gatewaylogs && gatewaylogs.length == 0) {
      fetchGatewayLogs();
    }
  }, []);

  const fetchAuthLogs = async () => {
    try {
      setLoading(true);
      const AuthLogs = await fetchAuthServerLogs();
      setAuthLogs(AuthLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchGatewayLogs = async () => {
    try {
      setLoading(true);
      const GatewayLogs = await fetchGatewayServerLogs();
      setGatewayLogs(GatewayLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshLogs = () => {
    if (serverType === "auth") {
      fetchAuthLogs();
    } else {
      fetchGatewayLogs();
    }
  };

  const filterLogs = () => {
    const logs = serverType === "auth" ? authLogs : gatewaylogs;
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp); // Assuming logs have timestamp field

      // Request type filter
      const typeMatch = requestType === "all" || log.method === requestType;

      // Status filter
      const statusMatch =
        statusFilter === "all" || log.status.toString() === statusFilter;

      // Date range filter
      let dateMatch = true;
      if (dateRange.start) {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(dateRange.start);
        dateMatch = dateMatch && logDate >= startDate;
      }
      if (dateRange.end) {
        const logDate = new Date(log.timestamp);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        dateMatch = dateMatch && logDate <= endDate;
      }
      return typeMatch && statusMatch && dateMatch;
    });
  };

  useEffect(() => {
    filterLogs();
  }, [requestType]);

  // const getFilteredLogs = () => {
  //   const logs = serverType === "auth" ? authLogs : gatewaylogs;
  //   if (requestType === "all" && statusFilter === "all") return logs;
  //   if (statusFilter === "all")
  //     return logs.filter((log) => log.method === requestType);
  //   if (requestType === "all")
  //     return logs.filter((log) => log.status == statusFilter);
  //   let filteredLogs = logs.filter((log) => log.method === requestType);
  //   return filteredLogs.filter((log) => log.status == statusFilter);
  // };

  return (
    <div className="system-monitor">
      <header className="monitor-header">
        <div className="header-content">
          <h1>
            {/* <span className="header-icon">🛡️</span> */}
            System Monitoring Console
          </h1>
          <p className="server-status">
            Monitoring:{" "}
            {serverType === "auth" ? "Authorization Server" : "API Gateway"}
          </p>
        </div>
        <Link to="/admin/dashboard" className="back-link">
          &larr; Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="monitor-main">
        <div className="controls-panel">
          <div className="server-selector">
            <button
              className={`server-btn ${serverType === "auth" ? "active" : ""}`}
              onClick={() => setServerType("auth")}
            >
              Auth Server Logs
            </button>
            <button
              className={`server-btn ${
                serverType === "gateway" ? "active" : ""
              }`}
              onClick={() => setServerType("gateway")}
            >
              API Gateway Logs
            </button>
          </div>

          <div className="refresh-controls">
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="request-type-select"
            >
              <option value="all">All Requests</option>
              <option value="GET">GET Requests</option>
              <option value="POST">POST Requests</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="request-type-select"
            >
              <option value="all">All Statuses</option>
              <option value="200">Success (200)</option>
              <option value="201">Created (201)</option>
              <option value="400">Bad Request (400)</option>
              <option value="401">Unauthorized (401)</option>
              <option value="403">Forbidden (403)</option>
              <option value="404">Not Found (404)</option>
              <option value="500">Server Error (500)</option>
            </select>

            <div className="filter-group">
              <label>Date Range:</label>
              <DateRangeSelector onDateChange={setDateRange} />
            </div>

            <button
              className="refresh-btn"
              onClick={refreshLogs}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Logs"}
            </button>
          </div>
        </div>

        <div className="logs-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>
                Loading {serverType === "auth" ? "Auth Server" : "API Gateway"}{" "}
                logs...
              </p>
            </div>
          ) : filterLogs().length === 0 ? (
            <div className="empty-state">
              <p>
                No {requestType !== "all" ? requestType + " " : ""}logs
                available for{" "}
                {serverType === "auth" ? "Auth Server" : "API Gateway"}
              </p>
            </div>
          ) : (
            <SystemLogView logs={filterLogs()} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="monitor-footer">
        <p>Last refreshed: {new Date().toLocaleString()}</p>
        <p>Total logs displayed: {`${serverType}Logs`.length}</p>
      </footer>
    </div>
  );
};

export default SystemMonitorConsole;
