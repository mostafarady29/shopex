const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const commissionQueue = new Queue('commission-processing', { connection });

async function addCommissionJob(referralId, delayMs = 30 * 24 * 60 * 60 * 1000) {
  // Delay default to 30 days for return period
  await commissionQueue.add('process-commission', { referralId }, {
    delay: delayMs
  });
}

module.exports = {
  commissionQueue,
  addCommissionJob
};
