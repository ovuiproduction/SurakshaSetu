// utils/logEvent.js
const ActionLog = require('../models/ActionLogs');

const logEvent = async ({
  vendorId,
  userId = null,
  consentId = null,
  tokenId = null,
  actionType,
  request,
  responseMeta,
}) => {
  try {
    const log = new ActionLog({
      vendorId,
      userId,
      consentId,
      tokenId,
      actionType,
      requestMeta: {
        endpoint: request.originalUrl,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        requestBody: request.body,
      },
      responseMeta,
    });

    await log.save();
  } catch (err) {
    console.error('Failed to log action:', err.message);
  }
};

module.exports = logEvent;
