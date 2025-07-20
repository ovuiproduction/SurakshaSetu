import axios from "axios";
const AUTH_SERVER_BASE_URL = `http://localhost:${process.env.REACT_APP_AUTH_SERVER_PORT}`;
const GATEWAY_SERVER_BASE_URL = `http://localhost:${process.env.REACT_APP_GATEWAY_SERVER_PORT}`;
const BANK_SERVER_BASE_URL = `http://localhost:${process.env.REACT_APP_BANK_SERVER_PORT}`;
const AUDIT_SERVER_URL = `http://localhost:${process.env.REACT_APP_AUDIT_SERVER_PORT}`;

export const fetchAllVendors = async () => {
  const response = await axios.get(
    `${AUTH_SERVER_BASE_URL}/api/admin/fetch-vendors`
  );
  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await axios.get(
    `${BANK_SERVER_BASE_URL}/api/user/fetch-users`
  );
  return response.data;
};

export const fetchLogsByVendor = async (vendorId) => {
  const response = await axios.get(
    `${AUTH_SERVER_BASE_URL}/api/admin/fetch-logs`,
    {
      params:{ vendorId },
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const fetchAuditReportByVendor = async (vendorId) => {
  const response = await axios.get(
    `${AUTH_SERVER_BASE_URL}/api/admin/audit/fetch-report`,
    {
       params:{ vendorId:vendorId },
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const fetchAllAuditReport = async () => {
  const response = await axios.get(
    `${AUTH_SERVER_BASE_URL}/api/admin/audit/fetch-reports`
  );
  return response.data;
};

const saveAuditReport = async (report, logs, vendorId, vendorName) => {
  try {
    const response = await axios.put(
      `${AUTH_SERVER_BASE_URL}/api/admin/audit/save-report`,
      { logs, vendorId, vendorName, report },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return "Report saved successfully";
  } catch (err) {
    return "Error in saving report";
  }
};

export const generateAuditReport = async (logs, vendorId, vendorName) => {
  try {
    const response = await axios.post(
      `${AUDIT_SERVER_URL}/audit/generate-report`,
      { logs, vendorName },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    saveAuditReport(response.data.response, logs, vendorId, vendorName);
    return response.data.response;
  } catch (err) {
    return "Error in Audit report generation.";
  }
};

export const fetchAuthServerLogs = async () => {
  try {
    const response = await axios.get(
      `${AUTH_SERVER_BASE_URL}/api/admin/system-logs/authorization-server`
    );
    return response.data.logs;
  } catch (err) {
    console.error("Error fetching logs:", err);
  }
};

export const fetchGatewayServerLogs = async () => {
  try {
    const response = await axios.get(
      `${GATEWAY_SERVER_BASE_URL}/api/admin/system-logs/apigateway-server`
    );
    return response.data.logs;
  } catch (err) {
    console.error("Error fetching logs:", err);
  }
};