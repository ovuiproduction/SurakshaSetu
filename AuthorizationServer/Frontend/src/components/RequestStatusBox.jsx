import React from "react";

import "../style/RequestStatusBox.css";

export default function RequestStatusBox({ status, responseMsg, onClose }) {
  if (status === "success") {
    return (
      <div className="message-block">
        <div className="message-div">
          <p className="success-msg">✅ {responseMsg && <>{responseMsg}</>}</p>
          <button className="btn-primary" onClick={() => onClose()}>
            Close
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="message-block">
        <div className="message-div">
          <p className="failed-msg">{responseMsg && <>{responseMsg}</>}</p>
          <button className="btn-primary" onClick={() => onClose()}>
            Close
          </button>
        </div>
      </div>
    );
  }
}
