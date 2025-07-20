import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/UserDashboard.css";

const BANK_SERVER_PORT = process.env.REACT_APP_BANK_SERVER_PORT;
const AUTH_SERVER_PORT = process.env.REACT_APP_AUTH_SERVER_PORT;

const UserDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [fieldSelections, setFieldSelections] = useState([]);
  const [expiryDays, setExpiryDays] = useState(30); // default 30 days

  const [user, setUser] = useState(null);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState({
    amount: "",
    type: "",
    description: "",
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser.userId;

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:${BANK_SERVER_PORT}/api/user/profile/${userId}`
      );
      setUser(res.data.user);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && !user) {
      fetchData();
    }
  }, [userId]);

  const handleRevoke = async (consentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this consent?"
    );
    if (!confirmed) return;

    try {
      await axios.post(
        `http://localhost:${AUTH_SERVER_PORT}/api/consent/revoke`,
        {
          consentId,
        }
      );

      setConsents((prev) =>
        prev.map((c) => (c._id === consentId ? { ...c, status: "revoked" } : c))
      );
      alert("Consent successfully revoked.");
      fetchConsentData();
    } catch (err) {
      console.error("Failed to revoke consent", err);
      alert("Failed to revoke consent. Please try again.");
    }
  };

  const handleTransactionSubmit = async (e) => {
    const formData = {
      userId,
      ...transaction,
      date: new Date(),
    };
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:${BANK_SERVER_PORT}/api/user/transaction`,
        formData,
        {
          header: {
            "content-type": "application/json",
          },
        }
      );
      alert("Transaction processed successfully!");
      setTransaction({ amount: "", type: "", description: "" });
      // Refresh data
      const res = await axios.get(
        `http://localhost:${BANK_SERVER_PORT}/api/user/profile/${userId}`
      );
      setUser(res.data.user);
    } catch (err) {
      console.error("Transaction error:", err);
      alert(
        `Transaction failed: ${
          err.response?.data?.message || "Please try again later"
        }`
      );
    }
  };

  const fetchConsentData = async () => {
    const fromData = { userId: user.userId };
    const res = await axios.post(
      `http://localhost:${AUTH_SERVER_PORT}/api/consent/get-consent-data`,
      fromData,
      {
        header: {
          "content-type": "application/json",
        },
      }
    );
    setConsents(res.data.consentList);
    console.log(consents);
  };

  const handleApproveClick = (consent) => {
    setSelectedConsent(consent);
    setFieldSelections(consent.scope); // default all selected
    setExpiryDays(30); // reset default
    setShowModal(true);
  };

  const handleModalApprove = async () => {
    try {
      await axios.post(
        `http://localhost:${AUTH_SERVER_PORT}/api/consent/approve-consent`,
        {
          consentId: selectedConsent._id,
          scope: fieldSelections,
          expiresInDays: expiryDays,
        }
      );

      // Update UI
      setConsents((prev) =>
        prev.map((c) =>
          c._id === selectedConsent._id
            ? { ...c, status: "approved", scope: fieldSelections }
            : c
        )
      );

      setShowModal(false);
      setSelectedConsent(null);
      fetchConsentData();
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Failed to approve consent. Try again.");
    }
  };

  const handleRejectClick = async(consent) => {
    setSelectedConsent(consent);
     try {
      await axios.post(
        `http://localhost:${AUTH_SERVER_PORT}/api/consent/reject-consent`,
        {
          consentId: selectedConsent._id,
        }
      );

      // Update UI
      setConsents((prev) =>
        prev.map((c) =>
          c._id === selectedConsent._id
            ? { ...c, status: "Rejected", scope: fieldSelections }
            : c
        )
      );

      setSelectedConsent(null);
      fetchConsentData();
    } catch (err) {
      console.error("Consent Reject Request failed:", err);
      alert("Failed to reject consent. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your banking dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Unable to Load Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="bank-dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-greeting">
            <h1>Welcome back, {user?.name}</h1>
            <p className="last-login">
              Last login: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="user-id">
            <span>Customer ID: {user?.userId}</span>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="dashboard-nav">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "accounts" ? "active" : ""}
          onClick={() => setActiveTab("accounts")}
        >
          Accounts
        </button>
        <button
          className={activeTab === "transactions" ? "active" : ""}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
        <button
          className={activeTab === "consents" ? "active" : ""}
          onClick={() => {
            fetchConsentData();
            setActiveTab("consents");
          }}
        >
          Consents Management
        </button>
      </nav>

      {/* Dashboard Content */}
      <main className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-tab">
            <section className="account-summary">
              <h2>Account Summary</h2>
              <div className="summary-cards">
                <div className="summary-card">
                  <h3>Account Number</h3>
                  <p className="account-number">{user.accountNumber}</p>
                  <p className="account-type">Current Account</p>
                </div>
                <div className="summary-card">
                  <h3>Monthly Salary</h3>
                  <p className="salary-amount">
                    ₹{user.salary.toLocaleString()}
                  </p>
                </div>
                <div className="summary-card">
                  <h3>Recent Transactions</h3>
                  <p className="tx-count">
                    {user.transactions?.length || 0} this month
                  </p>
                </div>
              </div>
            </section>

            <section className="personal-details">
              <h2>Personal Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{user.fullName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{user.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-value">
                    {new Date(user.dob).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">PAN Number</span>
                  <span className="detail-value">{user.pan}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{user.address}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "accounts" && (
          <section className="account-summary">
            <h2>Account Summary</h2>
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Bank Balance</h3>
                <p className="account-number">{user.bankBalance}</p>
              </div>
              <div className="summary-card">
                <h3>Monthly Salary</h3>
                <p className="salary-amount">₹{user.salary.toLocaleString()}</p>
              </div>
              <div className="summary-card">
                <h3>Recent Transactions</h3>
                <p className="tx-count">
                  {user.transactions?.length || 0} this month
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="transactions-tab">
            <section className="new-transaction">
              <h2>Initiate New Transaction</h2>
              <form onSubmit={handleTransactionSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      value={transaction.amount}
                      onChange={(e) =>
                        setTransaction({
                          ...transaction,
                          amount: e.target.value,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Transaction Type</label>
                    <select
                      value={transaction.type}
                      onChange={(e) =>
                        setTransaction({
                          ...transaction,
                          type: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Salary, Rent Payment, etc."
                    value={transaction.description}
                    onChange={(e) =>
                      setTransaction({
                        ...transaction,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  Process Transaction
                </button>
              </form>
            </section>

            <section className="transaction-history">
              <h2>Transaction History</h2>
              {user.transactions && user.transactions.length > 0 ? (
                <div className="tx-table-container">
                  <table className="tx-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.transactions.map((tx, i) => (
                        <tr key={i}>
                          <td>{new Date(tx.date).toLocaleDateString()}</td>
                          <td>
                            <span className={`tx-type ${tx.type}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="tx-amount">
                            ₹{tx.amount.toLocaleString()}
                          </td>
                          <td>{tx.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <p>No transactions found</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Consents Tab */}
        {activeTab === "consents" && (
          <div className="consents-tab">
            <section className="active-consents">
              <h2>Your Data Sharing Consents</h2>
              {consents && consents.length === 0 ? (
                <div className="no-data">
                  <p>You haven't shared data with any vendors yet</p>
                </div>
              ) : (
                <div className="consent-table-container">
                  <table className="consent-table">
                    <thead>
                      <tr>
                        <th>Vendor</th>
                        <th>Requested Data </th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Data Shared</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consents.map((consent) => (
                        <tr key={consent._id}>
                          <td className="vendor-name">{consent.orgName}</td>

                          <td className="data-fields">
                            {consent.scope.join(", ")}
                          </td>

                          <td className="purpose">{consent.purpose}</td>

                          <td>
                            <span
                              className={`consent-status ${consent.status}`}
                            >
                              {consent.status}
                            </span>
                          </td>

                          <td className="data-fields">
                            {consent.userApprovedScope.join(", ")}
                          </td>

                          <td className="actions">
                            {consent.status === "approved" && (
                              <button
                                onClick={() => handleRevoke(consent._id)}
                                className="revoke-btn"
                              >
                                Revoke Access
                              </button>
                            )}
                            {consent.status === "pending" && (
                              <div className="action-control-block">
                                <button
                                  onClick={() => handleApproveClick(consent)}
                                  className="approve-btn"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectClick(consent)}
                                  className="reject-btn"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {["rejected", "revoked", "expired"].includes(
                              consent.status
                            ) && (
                              <>
                                <p>None</p>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="security-note">
              <span className="security-icon">🔒</span>
              You have full control over your data sharing preferences. Revoking
              access will immediately stop data sharing with that vendor.
            </div>
          </div>
        )}
      </main>

      {/* Dashboard Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#security">Security</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#contact">Contact Support</a>
          </div>
          <div className="copyright">
            © {new Date().getFullYear()} SecureBank PLC. All rights reserved.
          </div>
        </div>
      </footer>

      {showModal && selectedConsent && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Approve Consent for {selectedConsent.orgName}</h2>

            <p>
              <strong>Purpose:</strong> {selectedConsent.purpose}
            </p>

            <div className="modal-section">
              <label>
                <strong>Select fields to share:</strong>
              </label>
              {selectedConsent.scope.map((field) => (
                <div key={field}>
                  <label>
                    <input
                      type="checkbox"
                      checked={fieldSelections.includes(field)}
                      onChange={() => {
                        setFieldSelections((prev) =>
                          prev.includes(field)
                            ? prev.filter((f) => f !== field)
                            : [...prev, field]
                        );
                      }}
                    />
                    {field}
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-section">
              <label>
                <strong>Consent Expiry (days):</strong>
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
              />
            </div>

            <div className="modal-buttons">
              <button className="approve-btn" onClick={handleModalApprove}>
                Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
