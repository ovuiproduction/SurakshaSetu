export default function SystemLogView({ logs }) {
  return (
    <div className="system-log-view-container">
      <div className="system-log-view-label">
        <h1>System Logs</h1>
        <span className="log-count">Total Logs : {logs.length}</span>
      </div>
      <div className="system-log-view">
        {logs?.map((log, index) => {
          const {
            timestamp,
            method,
            url,
            ip,
            request,
            response,
            status,
            duration,
          } = log;

          return (
            <div key={index} className="log-entry">
              <div className="log-header">
                <span className="log-timestamp">
                  {new Date(timestamp).toLocaleString()}
                </span>
                <span
                  className={`log-method log-method--${method.toLowerCase()}`}
                >
                  {method}
                </span>
                <span className="log-url">{url}</span>
                <span className="log-duration">{duration}ms</span>
                <span
                  className={`log-status log-status--${Math.floor(
                    status / 100
                  )}xx`}
                >
                  {status}
                </span>
              </div>

              <div className="log-meta">IP: {ip}</div>

              <div className="log-body">
                {request && (
                  <div className="log-section">
                    <h4 className="log-section-title">Request Body</h4>
                    <pre className="log-section-content">
                      {JSON.stringify(request, null, 2)}
                    </pre>
                  </div>
                )}

                {response && (
                  <div className="log-section">
                    <h4 className="log-section-title">Response Body</h4>
                    <pre className="log-section-content">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
