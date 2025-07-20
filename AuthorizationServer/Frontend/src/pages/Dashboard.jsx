import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/Dashboard.css";

const AUTH_SERVER_PORT = process.env.REACT_APP_AUTH_SERVER_PORT;

import ConsentModal from "../components/ConsentModal";
import RequestStatusBox from "../components/RequestStatusBox";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Dashboard = () => {
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);
  const [callbackLogs, setCallbackLogs] = useState([]);
  const [issuedTokens, setIssuedTokens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fetchedRecords, setFetchedRecords] = useState([]);
  const [activeTab, setActiveTab] = useState("activity");
  const [responseMsg, setResponseMsg] = useState("");
  const [responseModal, setResponseModal] = useState(false);
  const [responseStatus, setResponseStatus] = useState("");

  useEffect(() => {
    const verifySession = async () => {
      const data = localStorage.getItem("vendor");
      if (!data) {
        navigate("/login");
      } else {
        try {
          const parsedData = JSON.parse(data);
          const response = await axios.get(
            `http://localhost:${AUTH_SERVER_PORT}/api/verify-session`,
            {
              headers: {
                Authorization: `Bearer ${parsedData.clientSecret}`,
              },
            }
          );
          if (response.status == 200) {
            setVendor(response.data.vendor);
          } else {
            setVendor(parsedData);
          }
        } catch (err) {
          localStorage.removeItem("vendor");
          navigate("/login");
        }
      }
    };
    verifySession();
  }, [navigate]);

  // Fetch Data records
  const fetchDataRecord = async () => {
    try {
      const res = await axios.get(
        `http://localhost:${AUTH_SERVER_PORT}/api/vendor-data/fetch-records`,
        {
          params :  { clientId: vendor.clientId },
          header: {
            "content-type": "application/json",
          },
        }
      );
      if (res.status == 200) {
        setFetchedRecords(res.data);
        console.log(res.data);
        console.log(res);
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
    }
  };
  useEffect(() => {
    if (vendor) {
      fetchDataRecord();
    }
  }, [vendor]);

  // Fetch Consent request history
  const fetchRequestHistory = async () => {
    try {
      const res = await axios.get(
        `http://localhost:${AUTH_SERVER_PORT}/api/consent/get-vendor-history`,
        {
          params :  { clientId: vendor.clientId },
          header: {
            "content-type": "application/json",
          },
        }
      );
      if (res.status == 200) {
        setRequestHistory(res.data.consentList);
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
    }
  };
  useEffect(() => {
    if (vendor) {
      fetchRequestHistory();
    }
  }, [vendor]);

  // Fetch callbacklogs
  const fetchCallbackLogs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:${AUTH_SERVER_PORT}/api/vendor/fetch-callbacks`,
        {
          params :  { clientId: vendor.clientId },
          header: {
            "content-type": "application/json",
          },
        }
      );
      if (res.status == 200) {
        setCallbackLogs(res.data.callbacks);
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
    }
  };
  useEffect(() => {
    if (vendor) {
      fetchCallbackLogs();
    }
  }, [vendor]);

  // fetch all issued tokens
  const fetchIssuedTokens = async () => {
    try {
      const res = await axios.get(
        `http://localhost:${AUTH_SERVER_PORT}/api/vendor/fetch-tokens`,
        {
          params :  { clientId: vendor.clientId },
          header: {
            "content-type": "application/json",
          },
        }
      );
      if (res.status == 200) {
        setIssuedTokens(res.data.tokens);
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
    }
  };
  useEffect(() => {
    if (vendor) {
      fetchIssuedTokens();
    }
  }, [vendor]);

  const handleRequestToken = async (payload) => {
    try {
      const response = await axios.post(
        `http://localhost:${AUTH_SERVER_PORT}/api/token/request-token`,
        {
          clientId: payload.clientId,
          clientSecret: payload.clientSecret,
          userId: payload.userId,
          scope: payload.scope,
          purpose: payload.purpose,
          consentId: payload.consentId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResponseMsg(response.data.message);
      setResponseStatus("success");
    } catch (error) {
      // Error: Show error message from backend, or fallback message
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setResponseMsg(error.response.data.message);
      } else {
        setResponseMsg(error.message);
      }
      setResponseStatus("failed");
    } finally {
      // Show modal in both success and error cases
      setResponseModal(true);
    }
  };


  const handleRequestData = async (token) => {
    let message = "";

    try {
      const response = await axios.post(
        `http://localhost:${AUTH_SERVER_PORT}/api/vendor/apigateway/data-req`,
        {
          jwtToken: token.token,
          tokenId: token._id,
          userId: token.userId,
          clientId: token.clientId,
          consentId: token.consentId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResponseStatus("success");
      message = response.data.message;
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else {
        message = err.message; // fallback if custom message isn't available
      }
      setResponseStatus("failed");
    } finally {
      setResponseMsg(message);
      setResponseModal(true);
    }
  };

  // Consent request modal
  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    fetchRequestHistory();
  };

  // if vendor not exist
  if (!vendor) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header vendor={vendor} />

      <main className="dashboard-main">
        {/* Control Panel */}
        <section className="control-panel">
          <div className="panel-header">
            <h2>Data Request Management</h2>
            <button className="btn-primary generate-btn" onClick={openModal}>
              <i className="icon-key"></i> Generate User Token
            </button>
          </div>
        </section>

        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("activity");
            }}
          >
            <i className="icon-history"></i> Activity Logs
          </button>
          <button
            className={`tab-btn ${
              activeTab === "callbacklogs" ? "active" : ""
            }`}
            onClick={() => {
              fetchCallbackLogs();
              setActiveTab("callbacklogs");
            }}
          >
            <i className="icon-history"></i> CallbackLogs
          </button>
          <button
            className={`tab-btn ${
              activeTab === "IssuedTokens" ? "active" : ""
            }`}
            onClick={() => {
              fetchIssuedTokens();
              setActiveTab("IssuedTokens");
            }}
          >
            <i className="icon-history"></i> IssuedTokens
          </button>
          <button
            className={`tab-btn ${activeTab === "records" ? "active" : ""}`}
            onClick={() => {
              fetchDataRecord();
              setActiveTab("records");
            }}
          >
            <i className="icon-database"></i> Data Records
          </button>
          <button
            className={`tab-btn ${activeTab === "scope" ? "active" : ""}`}
            onClick={() => setActiveTab("scope")}
          >
            <i className="icon-shield"></i> Access Scope
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Activity Log Tab */}
          {activeTab === "activity" && (
            <section className="data-card">
              <div className="card-header">
                <h3>
                  <i className="icon-history"></i> Activity Log
                </h3>
              </div>
              <div className="card-body">
                {requestHistory && requestHistory.length === 0 ? (
                  <div className="empty-state">
                    <i className="icon-clock"></i>
                    <p>No activity recorded yet</p>
                  </div>
                ) : (
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>User ID</th>
                        <th>Purpose</th>
                        <th>Requested Scope</th>
                        <th>Status</th>
                        <th>Approved Scope</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestHistory.map((entry, idx) => (
                        <tr key={idx} className={entry.status}>
                          <td className="date-time">
                            {new Date(entry.createdAt).toLocaleString()}
                          </td>
                          <td>{entry.userId}</td>
                          <td>{entry.purpose}</td>
                          <td>
                            <div className="field-tags">
                              {entry.scope.map((field, i) => {
                                const [category, fieldName] = field.split(":");
                                return (
                                  <span key={i} className="field-tag">
                                    <span className="field-category">
                                      {category}
                                    </span>
                                    <span className="field-separator">:</span>
                                    <span className="field-name">
                                      {fieldName}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${entry.status}`}>
                              {entry.status}
                            </span>
                          </td>
                          <td>
                            <div className="field-tags">
                              {entry.userApprovedScope.map((field, i) => {
                                const [category, fieldName] = field.split(":");
                                return (
                                  <span key={i} className="field-tag">
                                    <span className="field-category">
                                      {category}
                                    </span>
                                    <span className="field-separator">:</span>
                                    <span className="field-name">
                                      {fieldName}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* Callbacklogs */}
          {activeTab === "callbacklogs" && (
            <section className="data-card">
              <div className="card-header">
                <h3>
                  <i className="icon-history"></i> Callback Logs
                </h3>
              </div>
              <div className="card-body">
                {callbackLogs && callbackLogs.length === 0 ? (
                  <div className="empty-state">
                    <i className="icon-clock"></i>
                    <p>No Callbacks recorded yet</p>
                  </div>
                ) : (
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>Consent Purpose</th>
                        <th>Scope</th>
                        <th>Callback URL</th>
                        <th>Status</th>
                        <th>Manual Mode</th>
                        <th>Sent At</th>
                        {/* <th>Retry Count</th> */}
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {callbackLogs.map((log, index) => (
                        <tr key={log._id}>
                          <td>{log.requestPayload?.purpose || "N/A"}</td>
                          <td>
                            {(log.requestPayload?.scope || []).join(", ")}
                          </td>
                          <td>{log.callbackUrl}</td>
                          <td>{log.status}</td>
                          <td>{log.manualMode ? "Yes" : "No"}</td>
                          <td>{new Date(log.sentAt).toLocaleString()}</td>
                          {/* <td>{log.retryCount}</td> */}
                          <td>
                            {log.manualMode && log.status === "success" ? (
                              <button
                                onClick={() =>
                                  handleRequestToken(log.requestPayload)
                                }
                                className="btn action-btn"
                              >
                                Request Token
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* Issued Tokens */}
          {activeTab === "IssuedTokens" && (
            <section className="data-card">
              <div className="card-header">
                <h3>
                  <i className="icon-history"></i> Issued Tokens Log
                </h3>
              </div>
              <div className="card-body">
                {issuedTokens && issuedTokens.length === 0 ? (
                  <div className="empty-state">
                    <i className="icon-clock"></i>
                    <p>No tokens issued yet</p>
                  </div>
                ) : (
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>Issued At</th>
                        <th>User ID</th>
                        <th>Purpose</th>
                        <th>Scope</th>
                        <th>Expires At</th>
                        <th>Consent ID</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuedTokens.map((token, idx) => (
                        <tr key={idx}>
                          <td className="date-time">
                            {new Date(token.issuedAt).toLocaleString()}
                          </td>
                          <td>{token.userId}</td>
                          <td>{token.purpose}</td>
                          <td>
                            <div className="field-tags">
                              {token.scope.map((field, i) => {
                                const [category, fieldName] = field.split(":");
                                return (
                                  <span key={i} className="field-tag">
                                    <span className="field-category">
                                      {category}
                                    </span>
                                    <span className="field-separator">:</span>
                                    <span className="field-name">
                                      {fieldName}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td>{new Date(token.expiresAt).toLocaleString()}</td>
                          <td>{token.consentId}</td>
                          <td>
                            <button
                              className="btn action-btn"
                              onClick={() => handleRequestData(token)}
                            >
                              Request Data
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}

          {/* Data Records Tab */}
          {activeTab === "records" && (
            <section className="data-card">
              <div className="card-header">
                <h3>
                  <i className="icon-database"></i> Data Records
                </h3>
              </div>
              <div className="card-body">
                {fetchedRecords && fetchedRecords.length === 0 ? (
                  <div className="empty-state">
                    <i className="icon-search"></i>
                    <p>No data records retrieved yet</p>
                  </div>
                ) : (
                  <div className="records-container">
                    <table>
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>Consent ID</th>
                          <th>Purpose</th>
                          <th>Fields</th>
                          <th>Fetched Data</th>
                          <th>Fetched At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fetchedRecords.map((record) => (
                          <tr key={record._id}>
                            <td>{record.userId}</td>
                            <td>{record.consentId}</td>
                            <td>{record.purpose}</td>
                            <td>
                              <div className="field-tags">
                                {record.fields.map((field, i) => {
                                  const [category, fieldName] =
                                    field.split(":");
                                  return (
                                    <span key={i} className="field-tag">
                                      <span className="field-category">
                                        {category}
                                      </span>
                                      <span className="field-separator">:</span>
                                      <span className="field-name">
                                        {fieldName}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td>
                              <div className="data-object">
                                {Object.entries(record.data).map(
                                  ([key, value]) => (
                                    <div key={key} className="data-field">
                                      <strong>{key}:</strong>
                                      {typeof value === "object" &&
                                      value !== null ? (
                                        <div className="nested-object">
                                          {Object.entries(value).map(
                                            ([nestedKey, nestedValue]) => (
                                              <div key={nestedKey}>
                                                <span className="nested-key">
                                                  {nestedKey}:
                                                </span>
                                                <span className="nested-value">
                                                  {typeof nestedValue ===
                                                  "string"
                                                    ? nestedValue
                                                    : JSON.stringify(
                                                        nestedValue
                                                      )}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        <span>{value?.toString()}</span>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </td>
                            <td className="date-time">
                              {new Date(record.fetchedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Access Scope Tab */}
          {activeTab === "scope" && (
            <section className="data-card">
              <div className="card-header">
                <h3>
                  <i className="icon-shield"></i> Authorized Data Access
                </h3>
              </div>
              <div className="card-body">
                <div className="scope-info">
                  <label>Approved Purpose</label>
                  <p className="purpose">{vendor.purpose}</p>
                </div>
                <div className="scope-fields">
                  <label>Data Fields</label>
                  <div className="field-tags">
                    {vendor.dataFields.map((field, index) => {
                      const [category, fieldName] = field.split(":");
                      return (
                        <span key={index} className="field-tag">
                          <span className="field-category">{category}</span>
                          <span className="field-separator">:</span>
                          <span className="field-name">{fieldName}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {showModal && (
        <ConsentModal vendor={vendor} onClose={() => closeModal(false)} />
      )}

      {responseModal && (
        <RequestStatusBox
          status={responseStatus}
          responseMsg={responseMsg}
          onClose={() => {
            setResponseModal(false);
            setResponseMsg("");
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
