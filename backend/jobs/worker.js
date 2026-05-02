const prisma = require('../config/prisma');

let commissionWorker = null;
let emailWorker = null;

try {
  const { Worker } = require('bullmq');

  const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying after 3 attempts
      return Math.min(times * 200, 1000);
    }
  };

  // Worker to process commissions after 30 days
  commissionWorker = new Worker('commission-processing', async job => {
    const { referralId } = job.data;
    
    if (job.name === 'process-commission') {
      console.log(`Processing commission for referral: ${referralId}`);
      
      await prisma.$transaction(async (tx) => {
          const referral = await tx.referral.findUnique({
              where: { id: referralId },
              include: { affiliate: true }
          });

          if (referral && referral.status === 'pending') {
              await tx.referral.update({
                  where: { id: referralId },
                  data: { status: 'available' }
              });

              await tx.wallet.update({
                  where: { affiliateId: referral.affiliateId },
                  data: {
                      pendingBalance: { decrement: referral.commissionAmount },
                      balance: { increment: referral.commissionAmount }
                  }
              });
              console.log(`Successfully processed $${referral.commissionAmount} for Affiliate ${referral.affiliateId}`);
          }
      });
    }
  }, { connection });

  emailWorker = new Worker('email-notifications', async job => {
    if (job.name === 'send-welcome') {
      console.log(`Sending welcome email to ${job.data.email}...`);
    } else if (job.name === 'send-payout') {
      console.log(`Sending payout notification of $${job.data.amount} to ${job.data.email}...`);
    }
  }, { connection });

  commissionWorker.on('completed', job => console.log(`Job ${job.id} completed!`));
  commissionWorker.on('failed', (job, err) => console.log(`Job ${job.id} failed with ${err.message}`));
  commissionWorker.on('error', () => {}); // Suppress connection errors

  emailWorker.on('error', () => {}); // Suppress connection errors

  console.log('✅ BullMQ workers initialized (Redis required for background jobs)');
} catch (err) {
  console.log('⚠️  BullMQ workers skipped — Redis not available. Background jobs disabled.');
}

module.exports = {
    commissionWorker,
    emailWorker
};
