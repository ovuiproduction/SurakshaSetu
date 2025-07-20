import React, { useState, useEffect } from "react";
import { fetctAuditReports } from "../../api/adminApi";
import AuditResponseDisplay from "./AuditResponseDisplay";
import "../../style/AuditReportsConsole.css";

const AuditReportsTab = ({ vendor }) => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const auditResponse = await fetctAuditReports(vendor.clientId);
        setReports(auditResponse.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="audit-reports-loading">Loading audit reports...</div>
    );
  }

  if (error) {
    return <div className="audit-reports-error">Error: {error}</div>;
  }

  return (
    <div className="audit-reports-grid">
      {reports.length === 0 ? (
        <div className="no-reports">No audit reports found</div>
      ) : (
        reports.map((report) => (
          <div
            key={report._id}
            className="audit-report-card"
            onClick={() => setSelectedReport(report)}
          >
            <div className="audit-report-card-header">
              <h3>{report.vendorName}</h3>
              <span className="audit-report-date">
                {formatDate(report.createdAt)}
              </span>
            </div>
            <div className="audit-report-card-body">
              <div className="audit-report-meta">
                <span>
                  <strong>Logs:</strong> {report.metadata.logCount}
                </span>
                <span>
                  <strong>Period:</strong>{" "}
                  {formatDate(report.metadata.timeRange.start)} -{" "}
                  {formatDate(report.metadata.timeRange.end)}
                </span>
              </div>
              <div className="audit-report-preview">
                {report.report.substring(0, 100)}...
              </div>
            </div>
          </div>
        ))
      )}
      {selectedReport && (
        <AuditResponseDisplay
          report={selectedReport.report}
          error={error}
          onClose={() => setSelectedReport(null)}
          vendorName={vendor.orgName}
        />
      )}
    </div>
  );
};

export default AuditReportsTab;
