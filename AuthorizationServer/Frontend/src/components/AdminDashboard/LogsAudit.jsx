import { useState } from "react";
import { generateAuditReport } from "../../api/adminApi";
import AuditResponseDisplay from "./AuditResponseDisplay";
import AuditReportLoader from './AuditReportLoader';

const LogsAudit = ({
  logs,
  userIdFilter,
  selectedVendorId,
  selectedVendorObj,
}) => {
  const [auditReport, setAuditReport] = useState("");
  const [error, setError] = useState("");
  const [responseStatus, setResponseStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuditLogs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await generateAuditReport(
        logs,
        selectedVendorId,
        selectedVendorObj.orgName
      );
      setAuditReport(response);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
      setResponseStatus(true);
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="no-logs">
        <p>No logs found for the current selection.</p>
        {selectedVendorId && (
          <p className="hint">
            Try selecting a different vendor or time period.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="log-viewer">
      <div className="log-viewer-header">
        <span>
          Transaction Logs
          <span className="log-count">{logs.length}</span>
          {userIdFilter && (
            <span className="filtered-count">
              {
                logs.filter((log) =>
                  log.userId?.toLowerCase().includes(userIdFilter.toLowerCase())
                ).length
              }
            </span>
          )}
        </span>
        <button
          onClick={handleAuditLogs}
          disabled={isLoading}
          className="audit-button"
        >
          {isLoading ? "Generating Report..." : "Audit Logs"}
        </button>
      </div>
      <div className="table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>User ID</th>
              <th>Vendor ID</th>
              <th>Consent ID</th>
              <th>Token ID</th>
              <th>Status</th>
              <th>Message</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log._id}
                className={
                  userIdFilter &&
                  log.userId &&
                  log.userId.toLowerCase().includes(userIdFilter.toLowerCase())
                    ? "highlight-row"
                    : ""
                }
              >
                <td>
                  <span
                    className={`action-badge ${log.actionType.toLowerCase()}`}
                  >
                    {log.actionType}
                  </span>
                </td>
                <td>{log.userId || "-"}</td>
                <td>{log.vendorId || "-"}</td>
                <td>{log.consentId || "-"}</td>
                <td>{log.tokenId || "-"}</td>
                <td>
                  <span
                    className={`status-badge ${
                      log.responseMeta?.status?.toLowerCase() || "unknown"
                    }`}
                  >
                    {log.responseMeta?.status || "-"}
                  </span>
                </td>
                <td className="message-cell">
                  {log.responseMeta?.message || "-"}
                </td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AuditReportLoader isLoading={isLoading} />
      {responseStatus && (
        <AuditResponseDisplay
          report={auditReport}
          error={error}
          onClose={() => {
            setResponseStatus(false);
            setAuditReport("");
            setError("");
          }}
          vendorName={selectedVendorObj.orgName || "All Vendors"}
        />
      )}
    </div>
  );
};

export default LogsAudit;
