import React from 'react';
import '../../style/AuditReportLoader.css';

const AuditReportLoader = ({ isLoading, message = "Generating report..." }) => {
  if (!isLoading) return null;

  return (
    <div className="audit-report-loader-overlay">
      <div className="audit-report-loader-container">
        <div className="audit-report-loader">
          <div className="loader-spinner"></div>
          <div className="loader-text">{message}</div>
          <div className="loader-subtext">This may take a few moments...</div>
        </div>
      </div>
    </div>
  );
};

export default AuditReportLoader;