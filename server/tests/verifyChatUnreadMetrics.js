import unreadService from '../services/chatUnreadMetricsService.js';

describe('Chat Unread Counts & Mark-As-Read API Test', () => {
  it('should expose getUnreadMessageCount method', () => {
    expect(typeof unreadService.getUnreadMessageCount).toBe('function');
  });

  it('should expose markThreadMessagesAsRead method', () => {
    expect(typeof unreadService.markThreadMessagesAsRead).toBe('function');
  });
});
