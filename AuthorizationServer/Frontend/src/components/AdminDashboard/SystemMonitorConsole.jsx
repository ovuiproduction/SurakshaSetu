import React, { useState, useEffect } from "react";
import {
  fetchAuthServerLogs,
  fetchGatewayServerLogs,
} from "../../api/adminApi";
import "../../style/SystemMonitorConsole.css";
import SystemLogView from "./SystemLogView";
import { Link } from "react-router-dom";

const SystemMonitorConsole = () => {
  const [authLogs, setAuthLogs] = useState([]);
  const [gatewaylogs, setGatewayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverType, setServerType] = useState("auth");
 const [requestType, setRequestType] = useState("all");
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

  const getFilteredLogs = () => {
    const logs = serverType === "auth" ? authLogs : gatewaylogs;

    if (requestType === "all") return logs;

    return logs.filter((log) => log.method === requestType);
  };

  return (
    <div className="system-monitor">
      <header className="monitor-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">🛡️</span>
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
            <button
              className="refresh-btn"
              onClick={refreshLogs}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Logs"}
            </button>
          </div>
        </div>

        {/* Logs Display */}
        {/* <div className="logs-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>
                Loading {serverType === "auth" ? "Auth Server" : "API Gateway"}{" "}
                logs...
              </p>
            </div>
          ) : `${serverType}Logs`.length === 0 ? (
            <div className="empty-state">
              <p>
                No logs available for{" "}
                {serverType === "auth" ? "Auth Server" : "API Gateway"}
              </p>
            </div>
          ) : serverType === "auth" ? (
            <SystemLogView logs={authLogs} />
          ) : (
            <SystemLogView logs={gatewaylogs} />
          )}
        </div> */}
         <div className="logs-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>
                Loading {serverType === "auth" ? "Auth Server" : "API Gateway"}{" "}
                logs...
              </p>
            </div>
          ) : getFilteredLogs().length === 0 ? (
            <div className="empty-state">
              <p>
                No {requestType !== "all" ? requestType + " " : ""}logs available for{" "}
                {serverType === "auth" ? "Auth Server" : "API Gateway"}
              </p>
            </div>
          ) : (
            <SystemLogView logs={getFilteredLogs()} />
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
