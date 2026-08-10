# FixNearby REST API Technical Specification

## Overview
This document defines the REST API endpoints, schemas, authentication contracts, and error structures for the FixNearby Hyperlocal Service Platform.

## Base URL
```
Development: http://localhost:5000/api
Production:  https://api.fixnearby.com/api
```

## Authentication & Headers
All requests to protected routes require JWT Bearer Tokens in request headers or HTTP-Only cookies:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
X-CSRF-Token: <DOUBLE_SUBMIT_CSRF_TOKEN>
Content-Type: application/json
```

---

## Endpoint Definitions

### 1. Authentication (`/api/auth`)
* `POST /api/auth/register` — Register new user or worker account.
* `POST /api/auth/login` — Authenticate and receive JWT tokens.
* `GET  /api/auth/me` — Retrieve current authenticated session profile.
* `POST /api/auth/logout` — Invalidate user session and clear auth cookies.

### 2. Worker Availability & Calendar (`/api/calendar`)
* `GET  /api/calendar/availability/:workerId` — Retrieve weekly time slot availability.
* `POST /api/calendar/availability/slot` — Add recurring or specific date work slot.
* `DELETE /api/calendar/availability/slot/:slotId` — Delete availability slot.

### 3. Worker Payouts & Stripe Express (`/api/payouts`)
* `GET  /api/payouts/details` — Fetch earnings balance and payout history.
* `POST /api/payouts/stripe-connect` — Generate Stripe Express onboarding link.
* `POST /api/payouts/request` — Trigger instant bank payout.

### 4. Dynamic Pricing & Surge Matrix (`/api/estimates`)
* `POST /api/estimates/surge` — Calculate dynamic surge estimate based on hour, distance, worker density, and emergency flags.

### 5. Emergency Dispatch (`/api/emergency`)
* `POST /api/emergency/broadcast` — Broadcast urgent service request to nearby workers.
* `GET  /api/emergency/active` — Fetch live active emergency alerts.
* `POST /api/emergency/accept/:alertId` — Accept urgent emergency dispatch.

### 5. Loyalty & Rewards (`/api/rewards`)
* `GET  /api/rewards/my-rewards` — Retrieve loyalty points balance and tier status.
* `POST /api/rewards/redeem` — Redeem points for discount coupons.

### 6. Geofencing (`/api/geofence`)
* `POST /api/geofence/update` — Save worker coverage radius and base coordinates.
* `GET  /api/geofence/:workerId` — Fetch worker service boundary radius.

---

## Standard Error Response Format
```json
{
  "success": false,
  "message": "Human readable error statement",
  "error": "Detailed exception string in non-production"
}
```
