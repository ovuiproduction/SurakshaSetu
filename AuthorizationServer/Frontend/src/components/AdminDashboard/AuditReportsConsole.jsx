import React, { useState, useEffect } from "react";
import { fetchAllVendors, fetchAllAuditReport } from "../../api/adminApi";
import AuditResponseDisplay from "./AuditResponseDisplay";
import "../../style/AuditReportsConsole.css";
import { Link } from "react-router-dom";

import Footer from "./Footer";

const AuditReportsConsole = () => {
  const [reports, setReports] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const vendorResponse = await fetchAllVendors();
        setVendors(vendorResponse.vendors);
        const auditResponse = await fetchAllAuditReport();
        setReports(auditResponse.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredReports = selectedVendor
    ? reports.filter((report) => report.vendorId === selectedVendor)
    : reports;

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
    <div className="audit-reports-console">
      <div className="monitor-header">
       <h1>Audit Reports</h1>
        <div className="audit-reports-filter">
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="vendor-filter-select"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.clientId} value={vendor.clientId}>
                {vendor.orgName} ({vendor.clientId})
              </option>
            ))}
          </select>
        </div>
        <Link to="/admin/dashboard" className="back-link">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="audit-reports-grid">
        {filteredReports.length === 0 ? (
          <div className="no-reports">No audit reports found</div>
        ) : (
          filteredReports.map((report) => (
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
      </div>

      {selectedReport && (
        <AuditResponseDisplay
          reportType={"Audit"}
          report={selectedReport.report}
          error={error}
          onClose={() => setSelectedReport(null)}
          vendorName={selectedReport.vendorName}
        />
      )}

      <Footer/>
    </div>
  );
};

export default AuditReportsConsole;
