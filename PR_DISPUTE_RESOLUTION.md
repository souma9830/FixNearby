## PR — feat(disputes): add end-to-end service dispute resolution portal

### Description
Adds a service dispute resolution & mediation portal that enables customers and workers to raise formal disputes regarding service bookings, upload evidence, track mediation status, and allow platform admins/mediators to resolve disputes.

### Changes
- **client/src/pages/disputes/DisputePortal.jsx** (NEW, +118 lines): User-facing dispute portal UI for filing, tracking, and viewing dispute status & history.
- **client/src/services/disputeService.js** (NEW, +24 lines): Frontend API client methods (`createDispute`, `getUserDisputes`, `getDisputeById`, `resolveDispute`).
- **server/controllers/disputeController.js** (NEW, +76 lines): Backend controllers managing dispute creation, retrieval, status updates, and admin resolution.
- **server/models/Dispute.js** (NEW, +55 lines): Mongoose model defining dispute fields (`bookingId`, `initiatorId`, `reason`, `evidence`, `status`, `resolutionNotes`).
- **server/routes/disputeRoutes.js** (NEW, +11 lines): Express API endpoints for dispute submission and status resolution under `/api/disputes`.
- **server/server.js** (MODIFIED, +4 lines): Mounted dispute resolution routes at `/api/disputes`.
- **.gitignore** (MODIFIED): Added `db/` and `screenshots/` to ignore local database files and screenshot assets.

### Testing
1. `cd server && npm run dev` then `cd client && npm run dev`
2. Log in as a user with a booking, navigate to `/disputes`
3. Fill out the dispute form with booking ID, reason, and evidence, then submit
4. Verify dispute appears in the active disputes list with status `Pending`
5. Test resolving dispute via `PATCH /api/disputes/:id/resolve` and verify status updates to `Resolved`
