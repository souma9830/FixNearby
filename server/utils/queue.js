import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let connection = null;
let notificationQueue = null;

export const getRedisConnection = () => {
  if (connection) return connection;
  try {
    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: () => null,
    });
    connection.on('error', () => {});
  } catch (err) {
    // Redis unavailable
  }
  return connection;
};

export const getNotificationQueue = () => {
  if (notificationQueue) return notificationQueue;
  const conn = getRedisConnection();
  if (!conn) return null;
  try {
    notificationQueue = new Queue('notification-queue', {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    });
  } catch (err) {
    // Queue unavailable
  }
  return notificationQueue;
};

export { notificationQueue };

export const queueNotification = async (jobName, data) => {
  const queue = getNotificationQueue();
  if (!queue) {
    console.log(`[Queue Fallback Logging] Redis offline. Simulating queueing of Job: "${jobName}" with data:`, data);
    return null;
  }
  try {
    const job = await queue.add(jobName, data);
    console.log(`[Queue] Job queued successfully: "${jobName}", Job ID: ${job.id}`);
    return job;
  } catch (error) {
    console.error(`[Queue Error] Failed to queue job "${jobName}":`, error.message || error);
    console.log(`[Queue Fallback Logging] Simulating queueing of Job: "${jobName}" due to error:`, data);
    return null;
  }
};
