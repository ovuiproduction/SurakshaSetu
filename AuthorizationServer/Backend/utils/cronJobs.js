const cron = require('node-cron');
const ConsentRequest = require('../models/consentRequest'); // adjust the path if needed

function startCronJobs() {
  // Auto-expire consents every midnight
  cron.schedule('0 0 * * *', async () => {
    console.log("⏰ Running consent auto-expire job...");

    try {
      const now = new Date();
      const expiredConsents = await ConsentRequest.updateMany(
        { status: 'approved', expiresAt: { $lt: now } },
        { $set: { status: 'expired' } }
      );
      console.log(`✅ Consents expired: ${expiredConsents.modifiedCount}`);
    } catch (err) {
      console.error("❌ Error while expiring consents:", err.message);
    }
  });
}

module.exports = startCronJobs;
