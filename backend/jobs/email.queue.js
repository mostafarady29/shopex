const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const emailQueue = new Queue('email-notifications', { connection });

async function sendWelcomeEmail(email, name) {
  await emailQueue.add('send-welcome', { email, name });
}

async function sendPayoutEmail(email, amount) {
  await emailQueue.add('send-payout', { email, amount });
}

module.exports = {
  emailQueue,
  sendWelcomeEmail,
  sendPayoutEmail
};
