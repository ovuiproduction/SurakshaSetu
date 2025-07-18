// import React from "react";

// const LogViewer = ({ logs }) => {
//   if (!logs || logs.length === 0)
//     return <p className="no-logs">No logs found.</p>;

//   return (
//     <div>
//       <div className="log-viewer-header">
//         <span>Logs</span>
//         <span className="log-count">{logs.length}</span>
//       </div>
//       <table className="log-table" >
//         <thead>
//           <tr>
//             <th>Action</th>
//             <th>User ID</th>
//             <th>Vendor ID</th>
//             <th>Consent ID</th>
//             <th>Token ID</th>
//             <th>Status</th>
//             <th>Message</th>
//             <th>Timestamp</th>
//           </tr>
//         </thead>
//         <tbody>
//           {logs.map((log) => (
//             <tr key={log._id}>
//               <td>{log.actionType}</td>
//               <td>{log.userId || "-"}</td>
//               <td>{log.vendorId || "-"}</td>
//               <td>{log.consentId || "-"}</td>
//               <td>{log.tokenId || "-"}</td>
//               <td>{log.responseMeta?.status}</td>
//               <td>{log.responseMeta?.message}</td>
//               <td>{new Date(log.timestamp).toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default LogViewer;

import React from "react";

const LogViewer = ({ logs, userIdFilter }) => {
  if (!logs || logs.length === 0) return <p className="no-logs">No logs found.</p>;

  return (
    <div>
      <div className="log-viewer-header">
        <span>
          Logs 
          <span className="log-count">{logs.length}</span>
          {userIdFilter && (
            <span className="filtered-count">
              {logs.filter(log => log.userId && log.userId.toLowerCase().includes(userIdFilter.toLowerCase())).length} filtered
            </span>
          )}
        </span>
      </div>
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
            <tr key={log._id}>
              <td>{log.actionType}</td>
              <td>{log.userId || "-"}</td>
              <td>{log.vendorId || "-"}</td>
              <td>{log.consentId || "-"}</td>
              <td>{log.tokenId || "-"}</td>
              <td>{log.responseMeta?.status}</td>
              <td>{log.responseMeta?.message}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogViewer;