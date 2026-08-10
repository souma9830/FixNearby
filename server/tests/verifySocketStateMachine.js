import { socketPresenceStore } from '../services/presenceService.js';
import { handleSocketStateMachine } from '../socketHandlers/socketStateMachine.js';

async function runTests() {
  console.log("=== STARTING WEBSOCKET HEARTBEAT & STATE MACHINE TEST ===");

  const mockSocketId = 'SOCKET_ABC123';
  const mockUserId = 'USER_XYZ789';

  // 1. Registering Socket Connection
  console.log("\n1. Registering socket connection state...");
  socketPresenceStore.registerSocket(mockSocketId, mockUserId, 'worker');
  
  console.log("Online Users Count:", socketPresenceStore.getOnlineUserCount());
  if (socketPresenceStore.getOnlineUserCount() === 1) {
    console.log("✅ SUCCESS: Socket registered and user marked online!");
  }

  // 2. Recording Heartbeat Ping/Pong
  console.log("\n2. Simulating heartbeat ping/pong keepalive...");
  const heartbeatOk = socketPresenceStore.recordHeartbeat(mockSocketId);
  console.log("Heartbeat Acknowledged:", heartbeatOk);

  // 3. Unregistering on disconnect
  console.log("\n3. Simulating socket disconnect unregistration...");
  socketPresenceStore.unregisterSocket(mockSocketId);
  console.log("Online Users Count after disconnect:", socketPresenceStore.getOnlineUserCount());

  if (heartbeatOk && socketPresenceStore.getOnlineUserCount() === 0) {
    console.log("=============================================");
    console.log("✅ ALL WEBSOCKET STATE MACHINE TESTS PASSED!");
    console.log("=============================================");
  }
}

runTests().catch(console.error);
