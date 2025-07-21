import { useEffect } from "react";
import "../../style/AuditResponseDisplay.css";

const AuditResponseDisplay = ({reportType, report, error, onClose, vendorName }) => {
  useEffect(() => {
    const element = document.getElementById("audit-report-container");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [report, error]);

  if (!report && !error) return null;

  return (
    <div className="audit-container" >
    <div id="audit-report-container" className="audit-report-container">
      <div className="audit-report-header">
        <h3>{reportType} Report for {vendorName}</h3>
        <button onClick={onClose} className="close-button">
          ×
        </button>
      </div>

      <div className="audit-report-content">
        {error ? (
          <div className="audit-error">
            <h4>Error Generating Report</h4>
            <pre>{error}</pre>
          </div>
        ) : (
          <div 
            className="markdown-report"
            dangerouslySetInnerHTML={{ 
              __html: formatMarkdownResponse(report) 
            }}
          />
        )}
      </div>
    </div>
    </div>
  );
};

// Helper function to format Gemini's markdown response
const formatMarkdownResponse = (text) => {
  if (!text) return "";
  
  // Convert markdown to HTML
  let html = text
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^#### (.*$)/gm, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");

  // Add list formatting
  html = html.replace(/^\s*-\s(.*$)/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");

  return html;
};

export default AuditResponseDisplay;