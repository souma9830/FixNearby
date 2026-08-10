/**
 * In-memory / Redis Task Queue Manager for asynchronous background job execution.
 * Handles job retries, Dead Letter Queue (DLQ) routing, and status telemetry.
 */

class TaskQueueManager {
  constructor() {
    this.jobs = new Map();
    this.dlq = [];
    this.handlers = new Map();
  }

  registerHandler(jobType, handlerFn) {
    this.handlers.set(jobType, handlerFn);
  }

  async enqueue(jobType, payload, options = {}) {
    const jobId = `JOB_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const jobRecord = {
      id: jobId,
      type: jobType,
      payload,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      status: 'QUEUED',
      createdAt: new Date()
    };

    this.jobs.set(jobId, jobRecord);
    this._processJob(jobId);
    return jobId;
  }

  async _processJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'FAILED';
      job.error = `No handler registered for job type '${job.type}'`;
      this.dlq.push(job);
      return;
    }

    job.status = 'PROCESSING';
    job.attempts += 1;

    try {
      const result = await handler(job.payload);
      job.status = 'COMPLETED';
      job.result = result;
    } catch (err) {
      if (job.attempts < job.maxAttempts) {
        job.status = 'RETRYING';
        setTimeout(() => this._processJob(jobId), 100 * job.attempts);
      } else {
        job.status = 'FAILED';
        job.error = err.message;
        this.dlq.push(job);
      }
    }
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  getDLQ() {
    return [...this.dlq];
  }
}

export const globalQueueManager = new TaskQueueManager();
