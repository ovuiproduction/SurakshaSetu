const GatewayServerLog = require("../models/GatewayServerLog");

const SENSITIVE_KEYS = [
  "password",
  "jwttoken",
  "token",
  "aadhar",
  "pan",
  "email",
  "phone",
  "otp",
  "clientsecret",
  "signature"
];

const maskSensitiveFields = (input) => {
  if (Array.isArray(input)) {
    return input.map(maskSensitiveFields);
  }

  if (input !== null && typeof input === "object") {
    const result = {};

    for (const key in input) {

      const lowerKey = key.toLowerCase();
      const value = input[key];
   
      if (SENSITIVE_KEYS.includes(lowerKey)) {
        result[key] = "****";
      } else if (typeof value === "string" && value.length > 100) {
        result[key] = value.slice(0, 100) + "... [truncated]";
      } else {
        result[key] = maskSensitiveFields(value);
      }
    }

    return result;
  }

  return input;
};


const logger = (req, res, next) => {
  const start = Date.now();

  if (!["POST", "GET"].includes(req.method)) return next();

  const { method, url, body } = req;
  const sanitizedBody = maskSensitiveFields(body);
  const ip = req.ip || req.connection.remoteAddress;

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    let responseBody;

    try {
      responseBody = typeof data === "string" ? JSON.parse(data) : data;
    } catch (e) {
      responseBody = { raw: data };
    }

    const sanitizedResponse = maskSensitiveFields(responseBody);

    let logEntry;
    if (method === "POST") {
      logEntry = new GatewayServerLog({
        method,
        url,
        ip,
        status: res.statusCode,
        duration,
        request: { body: sanitizedBody },
        response: sanitizedResponse,
      });
    } else if (method === "GET") {
      logEntry = new GatewayServerLog({
        method,
        url,
        ip,
        status: res.statusCode,
        duration,
        request: { body: sanitizedBody },
      });
    }

    if (logEntry) {
      logEntry.save().catch(console.error); // Fail silently to not affect flow
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
