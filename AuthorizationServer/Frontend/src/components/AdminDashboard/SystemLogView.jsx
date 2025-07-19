export default function SystemLogView({ logs }) {
  return (
    <div className="system-monitor-container">
      {logs?.map((log, index) => {
        const {
          timestamp,
          method,
          url,
          ip,
          requestBody,
          responseBody,
          status,
          duration,
        } = log;

        return (
          <div key={index} className="log-entry border p-4 my-2 bg-gray-100 rounded-md shadow-sm">
            <div className="log-header flex flex-wrap justify-between items-center mb-2">
              <span className="text-xs text-gray-500">{new Date(timestamp).toLocaleString()}</span>
              <span
                className={`px-2 py-0.5 rounded text-white text-sm ${
                  method === "POST" ? "bg-blue-600" : "bg-green-600"
                }`}
              >
                {method}
              </span>
              <span className="text-sm font-mono">{url}</span>
              <span className="text-xs text-gray-600">{duration}ms</span>
              <span
                className={`text-xs font-semibold ${
                  status >= 200 && status < 300 ? "text-green-700" : "text-red-600"
                }`}
              >
                {status}
              </span>
            </div>

            <div className="log-meta text-xs text-gray-600 mb-2">IP: {ip}</div>

            <div className="log-details space-y-2 text-sm font-mono">
              {requestBody && (
                <div>
                  <h4 className="font-semibold">Request Body</h4>
                  <pre className="bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(requestBody, null, 2)}
                  </pre>
                </div>
              )}

              {responseBody && (
                <div>
                  <h4 className="font-semibold">Response Body</h4>
                  <pre className="bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(responseBody, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
