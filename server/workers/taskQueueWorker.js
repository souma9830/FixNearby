/**
 * Background Task Worker initializing standard job handlers.
 */

import { globalQueueManager } from '../services/queueManager.js';

export const initializeTaskWorkers = () => {
  // Handler 1: Email Notification Job
  globalQueueManager.registerHandler('SEND_EMAIL', async (payload) => {
    if (payload.forceError) {
      throw new Error('SMTP Transport Timeout Error');
    }
    return { sent: true, recipient: payload.email, messageId: `MSG_${Date.now()}` };
  });

  // Handler 2: Report Export Job
  globalQueueManager.registerHandler('EXPORT_REPORT', async (payload) => {
    return { exported: true, fileUrl: `/downloads/report_${payload.reportId}.pdf` };
  });
};
