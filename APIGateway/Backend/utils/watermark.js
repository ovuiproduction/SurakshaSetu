const crypto = require("crypto");
const fs = require("fs");


function addEncryptedWatermark(data, watermarkInfo) {
  const publicKey = fs.readFileSync("gateway_private.pem", "utf-8");  key
  const watermark = {
    vendorId: watermarkInfo.clientId,
    userId: watermarkInfo.userId,
    consentId: watermarkInfo.consentId,
    timestamp: Date.now(),
  };

  const encrypted = crypto
    .publicEncrypt(publicKey, Buffer.from(JSON.stringify(watermark)))
    .toString("base64");

  return {
    dataWithWatermark: {
      ...data,
      _watermark: encrypted,
    },
    encryptedWatermark: encrypted,
    issuedAt: watermark.timestamp,
  };
}

module.exports = { addEncryptedWatermark };
