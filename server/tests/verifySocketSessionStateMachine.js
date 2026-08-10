import presenceMachine from '../services/socketSessionStateMachineService.js';

describe('WebSocket Heartbeat State Machine Test', () => {
  it('should register socket session and update online count', () => {
    presenceMachine.registerConnection('SOCK_1', 'USR_1', 'customer');
    expect(presenceMachine.getOnlineUsersCount()).toBe(1);
  });

  it('should handle ping keepalives and unregister clean on disconnect', () => {
    const ack = presenceMachine.processHeartbeatPing('SOCK_1');
    expect(ack).toBe(true);
    presenceMachine.unregisterConnection('SOCK_1');
    expect(presenceMachine.getOnlineUsersCount()).toBe(0);
  });
});
