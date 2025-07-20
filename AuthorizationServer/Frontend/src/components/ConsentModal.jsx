import React, { useState } from "react";
import axios from "axios";

import "../style/ConsentModal.css";

const GATEWAY_SERVER_PORT = process.env.REACT_APP_GATEWAY_SERVER_PORT;
const AUTH_SERVER_PORT = process.env.REACT_APP_AUTH_SERVER_PORT;

// Define available scopes centrally (could be fetched too)
const AVAILABLE_FIELDS = [
  "kyc:name",
  "kyc:pan",
  "kyc:aadhaar",
  "kyc:dob",
  "kyc:gender",
  "kyc:address",
  "contact:email",
  "contact:phone",
  "account:accountNumber",
  "account:bankBalance",
  "account:salary",
  "transactions:transactions",
];

const ConsentModal = ({ vendor, onClose }) => {
  const [userId, setUserID] = useState("USER-4B97980E");
  const [callbackUrl, setCallbackUrl] = useState(
    "http://localhost:5001/api/consent/callback"
  );
  const [selectedFields, setSelectedFields] = useState([]);
  const [consentSent, setConsentSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consentReqStatus, setConsentReqStatus] = useState("");

  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const initiateConsent = async () => {
    setError("");

    if (!userId || !callbackUrl || selectedFields.length === 0) {
      setError("Please fill all fields and select at least one data field.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:${AUTH_SERVER_PORT}/api/consent/initiate`,
        {
          userId,
          clientId: vendor.clientId,
          clientSecret: vendor.clientSecret,
          purpose: vendor.purpose,
          scope: selectedFields,
          callbackUrl,
        }
      );

      setConsentReqStatus(res.data.message);
      setConsentSent(true);
    } catch (err) {
      setConsentReqStatus(
        err.response?.data?.message || "Consent initiation failed"
      );
      setConsentSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>Request User Consent</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {!consentSent ? (
            <>
              <div className="form-group">
                <label htmlFor="userId">Bank User ID</label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserID(e.target.value)}
                  placeholder="Enter bank user ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Callback URL</label>
                <input
                  type="url"
                  value={callbackUrl}
                  onChange={(e) => setCallbackUrl(e.target.value)}
                  placeholder="https://your-server.com/callback"
                  required
                />
              </div>

              <div className="form-group">
                <label>Purpose</label>
                <div className="readonly-field">{vendor.purpose}</div>
              </div>

              <div className="form-group">
                <label>Select Data Fields (Scope)</label>
                <div className="checkbox-grid">
                  {AVAILABLE_FIELDS.map((field) => (
                    <label key={field} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field)}
                        onChange={() => toggleField(field)}
                      />
                      {field}
                    </label>
                  ))}
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              <div className="modal-footer">
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={initiateConsent}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Consent"}
                </button>
              </div>
            </>
          ) : (
            <div className="success-message">
              <p>✅ {consentReqStatus && <>{consentReqStatus}</>}</p>
              <button className="btn-primary" onClick={() => onClose()}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
