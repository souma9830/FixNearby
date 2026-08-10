# FixNearby Real-Time Socket.IO Protocol Specification

## Overview
FixNearby relies on bidirectional WebSockets via Socket.IO for real-time messaging, emergency alerts, booking status transitions, and presence tracking.

## Socket Connection Handshake
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: '<JWT_TOKEN>' },
  transports: ['websocket', 'polling']
});
```

---

## Room Namespaces & Channels

| Room Pattern | Purpose |
| :--- | :--- |
| `conversation:<id>` | 1-on-1 Chat room between user and worker |
| `booking:<id>` | Live updates for specific booking lifecycle |
| `worker:emergency` | High priority emergency alert channel for active workers |

---

## Inbound / Outbound Event Contracts

### 1. Chat Messaging
* `send_message`: `{ conversationId, content, attachment? }`
* `new_message`: `{ messageId, senderId, content, attachment, createdAt }`
* `typing_start`: `{ conversationId, recipientId }`
* `typing_stop`: `{ conversationId, recipientId }`

### 2. Emergency Broadcasts
* `emergency:broadcast`: `{ alertId, issueType, location, coordinates }`
* `emergency:accept`: `{ alertId, workerId, workerPhone }`

### 4. Resilient Offline Event Queueing & Reconnection
* `socketOfflineQueue`: LocalStorage-backed client event buffer holding outbound messages during disconnects.
* Automatic flush upon reconnection event (`connect` hook).
* `availability-update`: Triggered when worker alters schedule slots.
* `booking:statusUpdate`: `{ bookingId, status, updatedAt }`
