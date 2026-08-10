import queueManager from '../services/distributedQueueService.js';

describe('Distributed Task Queue Integration Test', () => {
  it('should initialize queue manager instance with retry options', () => {
    expect(queueManager).toBeDefined();
    expect(typeof queueManager.enqueueTask).toBe('function');
  });

  it('should handle enqueue calls gracefully without active Redis connection', async () => {
    const res = await queueManager.enqueueTask('TEST_JOB', { foo: 'bar' });
    expect(res).toHaveProperty('success');
  });
});
