const GatewayServerLog = require("../models/GatewayServerLog");

const SENSITIVE_KEYS = ["password", "jwtToken", "token", "aadhar", "pan", "email", "phone"];

const maskSensitiveFields = (obj = {}) => {
  const clone = { ...obj };
  for (let key in clone) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clone[key] = "****";
    } else if (typeof clone[key] === "string" && clone[key].length > 100) {
      clone[key] = clone[key].substring(0, 100) + "... [truncated]";
    }
  }
  return clone;
};

const logger = (req, res, next) => {
  const start = Date.now();

  // Only log important methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();

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

    const logEntry = new GatewayServerLog({
      method,
      url,
      ip,
      status: res.statusCode,
      duration,
      request: { body: sanitizedBody },
      response: sanitizedResponse,
    });

    logEntry.save().catch(console.error); // Fail silently to not affect flow

    return originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
