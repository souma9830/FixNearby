import { Queue, Worker } from 'bullmq';
import logger from '../utils/logger.js';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  retryStrategy: () => null
};

export class DistributedTaskQueueManager {
  constructor(queueName = 'default-task-queue') {
    this.queueName = queueName;
    this.queue = null;
    this.worker = null;
  }

  initQueue() {
    try {
      this.queue = new Queue(this.queueName, {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true
        }
      });
      logger.info(`[QueueManager]: Initialized BullMQ queue ${this.queueName}`);
    } catch (err) {
      logger.warn(`[QueueManager]: Redis queue initialization offline fallback - ${err.message}`);
    }
  }

  async enqueueTask(name, data, opts = {}) {
    if (!this.queue) return { success: false, isFallback: true };
    const job = await this.queue.add(name, data, opts);
    return { success: true, jobId: job.id };
  }

  registerWorker(processorFn) {
    try {
      this.worker = new Worker(this.queueName, async (job) => {
        logger.info(`[Worker]: Processing job ${job.id} (${job.name})`);
        return await processorFn(job);
      }, { connection });

      this.worker.on('failed', (job, err) => {
        logger.error(`[Worker]: Job ${job?.id} failed with error ${err.message}`);
      });
    } catch (err) {
      logger.warn(`[Worker]: Worker registration skipped - ${err.message}`);
    }
  }
}

export default new DistributedTaskQueueManager();
