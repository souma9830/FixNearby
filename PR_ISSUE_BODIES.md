# PR and Issue Bodies — FixNearby 10 Feature Branches

---

## Issue #1 — Worker Identity Verification & Badge System

**Title:** feat(worker): add identity verification and badge system

**Description:**
Workers need a way to prove their identity and qualifications to build trust with customers. Currently there is no verification workflow — anyone can claim to be a professional without any proof.

Implement a complete identity verification system where workers upload documents, admins review submissions, and verified workers receive a visible badge on their profile and search results.

**Requirements:**
- `VerificationPage.jsx` — File upload UI for identity documents (passport, driver's license, national ID), selfie with ID, address proof, professional license, insurance
- `Verification.js` model with `workerId`, `status` (pending/approved/rejected/expired), `verifiedAt`, `expiresAt`, `rejectionReason`
- `verificationController.js` — submit, status check, admin pending queue, approve/reject with notes, stats
- `verificationRoutes.js` — all REST endpoints with admin guards
- Worker model: add `isVerified` boolean and `verificationBadge` string fields
- Display verified badge on worker cards, profile, and markers in search results

**Acceptance Criteria:**
- Workers can upload all document types with drag-and-drop
- Admins see a pending verification queue with document previews
- Approve/reject actions update worker's `isVerified` status
- Verified badge renders on all worker surfaces (cards, map, profile)
- Verification expires after 1 year with re-submission flow
- Rejected submissions include admin notes and allow re-upload

---

## PR #1 — feat(worker): add identity verification and badge system

Closes #1

### Changes
- **client/src/pages/worker/VerificationPage.jsx** (NEW, +470 lines): Full verification wizard with drag-and-drop document upload, status banner, preview thumbnails, re-submission on rejection. Route: `/worker/verification`
- **client/src/services/verificationService.js** (NEW, +85 lines): API client — `submitVerification`, `getVerificationStatus`, `getPendingVerifications`, `approveVerification`, `rejectVerification`, `getVerificationStats`, `uploadDocument`
- **server/controllers/verificationController.js** (NEW, +337 lines): 7 controllers — submit (multipart), status, pending queue (admin), approve, reject, stats, upload
- **server/models/Verification.js** (NEW, +80 lines): Mongoose schema with all identity fields, unique index on `workerId`, compound index on `status+createdAt`
- **server/models/Worker.js** (MODIFIED): Added `isVerified: Boolean` (default false) and `verificationBadge: String`
- **server/routes/verificationRoutes.js** (NEW, +46 lines): 7 endpoints under `POST /submit`, `GET /status`, `GET /pending`, `GET /stats`, `PATCH /:id/approve`, `PATCH /:id/reject`, `POST /upload`
- **client/src/App.jsx**: Added route `/worker/verification`
- **server/server.js**: Mounted verification routes at `/api/verification`

### Testing
1. `cd server && npm run dev` then `cd client && npm run dev`
2. Login as a worker, navigate to `/worker/verification`
3. Upload documents and submit — verify status shows "Pending"
4. Login as admin via DB, check `/pending` queue
5. Approve a submission — verify badge appears on worker profile
6. Verify badge renders on Services page worker cards

---

## Issue #2 — Interactive Map View for Worker Discovery

**Title:** feat(workers): add interactive map view for worker discovery

**Description:**
The Services page only has a list view. Users browsing for nearby workers need a geographical map view to visually discover workers in their area. This is especially important for location-based services like plumbing, electrical work, and home repairs.

Add an interactive SVG-based map with pan/zoom, worker pins with status colors, info popups, and a list/map toggle on the Services page.

**Requirements:**
- `WorkerMap.jsx` — SVG-based interactive map with pan/drag, zoom buttons, scroll-wheel zoom
- Worker pins color-coded by status (green=available, orange=busy, gray=offline)
- Info popup on pin click with "View Profile" navigation
- `useMapFilters.js` — URL-synced filters for category, availability, rating, price
- `Services.jsx` — map/list view toggle button
- Backend: `getWorkersByBounds` and `getWorkerClusters` endpoints

**Acceptance Criteria:**
- Users can pan and zoom the map smoothly
- Worker pins render at correct coordinates with status colors
- Clicking a pin shows a popup with worker name and profile link
- Map/list toggle preserves filter state
- Bounding box queries return only workers in the visible area

---

## PR #2 — feat(workers): add interactive map view for worker discovery

Closes #2

### Changes
- **client/src/components/WorkerMap.jsx** (NEW, +365 lines): SVG interactive map with pan/drag, zoom controls, worker pins with status colors, Lucide icons, info popup with "View Profile" navigation
- **client/src/hooks/useMapFilters.js** (NEW, +47 lines): URL search param-synced filter state: category, availability, minRating, maxPrice
- **client/src/pages/Services.jsx** (MODIFIED, +42/-3 lines): Added Map/List toggle button, integrated WorkerMap, scroll-to-card on marker click
- **client/src/services/mapService.js** (NEW, +27 lines): `getWorkersInBounds(bounds)`, `getClusterData(bounds, zoom)`
- **server/controllers/workerController.js** (MODIFIED, +91 lines): Added `getWorkersByBounds` (geo bounding box query) and `getWorkerClusters` (aggregation pipeline)
- **server/routes/workerRoutes.js** (MODIFIED): Added `GET /map-bounds` and `GET /clusters`

### Testing
1. Start both servers
2. Navigate to `/services`, click "Map View" toggle
3. Pan and zoom — verify worker pins appear
4. Click a pin — verify popup with profile link
5. Apply filters — verify map pins update
6. Switch back to list view — verify content changes

---

## Issue #3 — In-App Notification Center with Real-Time Badge

**Title:** feat(notifications): add in-app notification center with real-time badge

**Description:**
Users currently have no way to see notifications within the app. Important updates about bookings, messages, and system announcements are invisible until users manually check. Add a full notification center with a live unread count badge on the navbar.

**Requirements:**
- `Notifications.jsx` — paginated notification list with filter tabs (All/Unread/Bookings/Messages/System)
- Type-based icons and priority indicators (low/normal/high/urgent)
- Mark all read, individual mark-as-read, and delete
- Navbar bell icon with polling unread badge (60s interval)
- 7 notification types: booking_reminder, status_update, new_message, review_response, promotion, system, payout
- Relative-time display (e.g., "2 hours ago")

**Acceptance Criteria:**
- Unread count badge updates on navbar every 60 seconds
- Clicking bell navigates to `/notifications`
- Filter tabs correctly scope notifications
- Mark all read clears the badge
- Individual read/delete actions work
- Loading skeleton displays during fetch

---

## PR #3 — feat(notifications): add in-app notification center with real-time badge

Closes #3

### Changes
- **client/src/pages/Notifications.jsx** (NEW, +390 lines): Filter tabs, paginated list, skeleton loading, type icons, priority dots, mark-all-read, individual read/delete, relative-time
- **client/src/components/Navbar.jsx** (MODIFIED, +49 lines): Bell icon with unread badge, 60s polling via `getUnreadCount`, mobile menu link
- **client/src/services/notificationService.js** (NEW, +59 lines): `getNotifications`, `markAsRead`, `markAllAsRead`, `deleteNotification`
- **server/controllers/notificationController.js** (NEW, +176 lines): 5 controllers — getNotifications (paginated, filterable), markAsRead, markAllAsRead, getUnreadCount, deleteNotification
- **server/models/Notification.js** (NEW, +69 lines): Mongoose schema — 7-type enum, priority levels, Mixed metadata, compound indexes
- **server/routes/notificationRoutes.js** (NEW, +31 lines): `GET /`, `PATCH /:id/read`, `PATCH /read-all`, `GET /unread-count`, `DELETE /:id`
- **client/src/App.jsx**: Added `/notifications` route (RequireAuth)
- **server/server.js**: Mounted notification routes

### Testing
1. Login and navigate — verify bell icon shows 0 or unread count
2. Trigger a notification (e.g., create a booking) — verify badge updates
3. Open `/notifications` — verify list renders with correct icons
4. Filter by "Unread" — verify only unread items show
5. Click "Mark All Read" — verify badge clears, all items show as read
6. Delete a notification — verify it disappears from list

---

## Issue #4 — Side-by-Side Worker Comparison Tool

**Title:** feat(workers): add side-by-side worker comparison tool

**Description:**
When choosing between multiple workers, users have to manually compare profiles by opening multiple tabs. This is cumbersome and error-prone. Add a side-by-side comparison tool where users can select up to 3 workers and see their attributes in a single view with best-value highlighting.

**Requirements:**
- `CompareWorkers.jsx` — comparison view with up to 3 columns
- Compare dimensions: rating, experience, price, location, verified status, response time, completed jobs, karma score, availability, bio, service coverage
- Best-value highlights (best price/rating/experience) marked with emerald badges
- Worker IDs synced to URL params `?ids=id1,id2,id3` for shareability
- `useWorkerComparison.js` hook with add/remove/clear methods
- Services page: "Compare" checkboxes on worker cards

**Acceptance Criteria:**
- Users can select 2-3 workers and click "Compare"
- Comparison page shows clean side-by-side layout
- Best values in each category are highlighted
- URL is shareable and restores comparison on load
- Removing a worker updates the comparison in real-time

---

## PR #4 — feat(workers): add side-by-side worker comparison tool

Closes #4

### Changes
- **client/src/pages/CompareWorkers.jsx** (NEW, +323 lines): 3-column comparison with avatars, stats, badges, best-value highlights. Route: `/compare-workers?ids=...`
- **client/src/hooks/useWorkerComparison.js** (NEW, +81 lines): URL-synced state via `useSearchParams`, `addWorker`, `removeWorker`, `clearAll`, max 3 workers
- **client/src/pages/Services.jsx** (MODIFIED, +85/-2 lines): Compare checkboxes on worker cards, "Compare (N)" floating button
- **client/src/services/workerService.js** (MODIFIED): Added `getWorkersByIds(ids)`
- **server/controllers/workerController.js** (MODIFIED, +22 lines): Added `getWorkersBatch` — accepts array of IDs, returns documents
- **server/routes/workerRoutes.js** (MODIFIED): Added `POST /batch` endpoint

### Testing
1. Go to `/services`, check 2-3 worker checkboxes
2. Click "Compare (N)" button — navigate to comparison page
3. Verify all 3 columns render with correct data
4. Verify best-value badges on relevant attributes
5. Copy URL, open in new tab — verify comparison restores
6. Click "Clear All" — navigate back to services

---

## Issue #5 — Community Service Request System with Voting

**Title:** feat(services): add service request system with voting

**Description:**
Users sometimes need services that aren't listed on the platform. There's no way for them to request new categories. Add a community-driven service request system where users submit requests, upvote existing ones for demand signaling, and admins can review/approve/reject them.

**Requirements:**
- `RequestService.jsx` — submission form with category, description, urgency, location, schedule, budget fields
- Upvoting mechanism for demand signaling
- Status tracking per request (pending/reviewed/approved/rejected/fulfilled)
- User request history with status badges
- Admin management view with filterable queue

**Acceptance Criteria:**
- Users can submit service requests with all required fields
- Other users can upvote requests (one vote per user)
- Status transitions are tracked and displayed
- Admin can update status with notes
- Paginated history for both user and admin views

---

## PR #5 — feat(services): add service request system with voting

Closes #5

### Changes
- **client/src/pages/RequestService.jsx** (NEW, +453 lines): Hero section, multi-field form with validation, submission success state, user's previous requests list with upvote buttons, animated status badges. Route: `/request-service`
- **client/src/services/serviceRequestService.js** (NEW, +36 lines): `createRequest`, `getMyRequests`, `upvoteRequest`
- **server/controllers/serviceRequestController.js** (NEW, +191 lines): 6 controllers — createRequest, getMyRequests (paginated), getAllRequests (admin, filterable), getRequestById, updateRequestStatus (admin), upvoteRequest
- **server/models/ServiceRequest.js** (NEW, +63 lines): Mongoose schema — category, description (max 2000), urgency enum, location, preferredSchedule enum, budget enum, status enum, adminNotes, voteCount. Indexed on `status+createdAt`, `userId+createdAt`, `categoryName`
- **server/routes/serviceRequestRoutes.js** (NEW, +23 lines): `POST /`, `GET /my`, `GET /all` (admin), `GET /:id`, `PATCH /:id/status` (admin), `POST /:id/upvote`
- **client/src/App.jsx**: Added `/request-service` route
- **server/server.js**: Mounted service request routes

### Testing
1. Login, navigate to `/request-service`
2. Fill form, submit — verify success state and new entry in history
3. Submit a second request — verify both appear in "My Requests"
4. Upvote another user's request, then upvote again — verify second vote is ignored
5. Login as admin, check `/api/service-requests/all` — verify all requests with vote counts
6. Change a request status — verify user sees updated status

---

## Issue #6 — Visual Booking Status Timeline Component

**Title:** feat(bookings): add visual booking status timeline component

**Description:**
Users and workers currently see only the current booking status as text. There's no chronological view of all status transitions. Add a visual timeline component that shows the full booking lifecycle as a step-through with icons, timestamps, actor names, and admin notes.

**Requirements:**
- `BookingTimeline.jsx` — reusable timeline component with status-based icons and colors
- Status steps: Pending → Accepted → Reminder Sent → En Route → In-Progress → Completed → Cancelled
- "Done" and "Latest" badges on appropriate steps
- Animated fade-in-up entrance for steps
- Connector lines between steps
- `Bookings.jsx` — expandable inline timeline per booking

**Acceptance Criteria:**
- Each booking shows a "View Timeline" toggle
- Timeline renders all historical status transitions chronologically
- Each step shows icon, label, timestamp, actor name, and note
- Current/latest step is highlighted with "Latest" badge
- Cancelled bookings show the timeline up to cancellation reason

---

## PR #6 — feat(bookings): add visual booking status timeline component

Closes #6

### Changes
- **client/src/components/BookingTimeline.jsx** (NEW, +189 lines): Status config with icons/colors per status, chronological sort, skeleton loading, animated step entries, connector lines, "Done"/"Latest" badges, timestamp+actor+note display
- **client/src/hooks/useBookingTimeline.js** (NEW, +43 lines): Fetches `getBookingTimeline(id)`, exposes `steps`, `loading`, `error`, `refresh`
- **client/src/pages/Bookings.jsx** (MODIFIED, +45/-2 lines): "View Timeline"/"Hide Timeline" toggle per booking card
- **client/src/services/bookingService.js** (MODIFIED): Added `getBookingTimeline(bookingId)`
- **server/controllers/bookingController.js** (MODIFIED, +42 lines): Added `getBookingTimeline` — returns `statusHistory` with populated `changedBy` names, ensures current status is included
- **server/routes/bookingRoutes.js** (MODIFIED): Added `GET /:id/timeline` with `requireBookingParticipant` middleware

### Testing
1. Create a booking as a user
2. Navigate to `/bookings`, click "View Timeline" on that booking
3. Verify timeline shows "Pending" step with creation timestamp
4. Have the worker accept the booking — refresh and check timeline
5. Verify "Accepted" step appears with "Latest" badge
6. Complete the booking cycle — verify all steps render with correct icons

---

## Issue #7 — Payment Checkout Flow with History and Refunds

**Title:** feat(payment): add payment checkout flow with history and refunds

**Description:**
There is no payment system in the app. Users cannot pay for bookings through the platform. Add a complete checkout flow with multiple payment methods, payment history, and refund requests. Use a mock payment gateway with realistic UI.

**Requirements:**
- `PaymentCheckout.jsx` — multi-state page (form → processing → success → error)
- Payment method selection: credit card, bank transfer, digital wallet
- Card input with masking (XXXX XXXX XXXX XXXX), expiry (MM/YY), CVV
- Payment intent creation, confirmation, loading spinner, success checkmark
- Duplicate payment prevention (unique booking constraint)
- Payment history with pagination, single payment detail view
- Refund request with reason, admin review

**Acceptance Criteria:**
- Checkout flow renders with booking amount pre-filled
- Card validation prevents invalid inputs
- Successful payment shows confirmation with transaction ID and receipt URL
- Duplicate payments are rejected with meaningful error
- Payment history shows all past transactions
- Refund requests are stored for admin processing

---

## PR #7 — feat(payment): add payment checkout flow with history and refunds

Closes #7

### Changes
- **client/src/pages/PaymentCheckout.jsx** (NEW, +491 lines): 4-state page (form → processing → success → error), payment method cards, card masking + expiry/CCV formatting, validation, animated spinner, success checkmark. Route: `/payment/checkout?bookingId=...&amount=...`
- **client/src/services/paymentService.js** (NEW, +26 lines): `createPaymentIntent(bookingId, amount)`, `confirmPayment(bookingId, paymentIntentId, method)`
- **server/controllers/paymentController.js** (NEW, +275 lines): 5 controllers — createPaymentIntent (validate booking, deduplicate, generate client secret), confirmPayment (validate, generate transaction ID + receipt URL), getPaymentHistory (paginated, populated), getPaymentById (auth check), requestRefund (validate, store reason)
- **server/models/Payment.js** (NEW, +64 lines): Mongoose schema — amount, currency (USD), method enum, status enum (pending/completed/failed/refunded), unique bookingId, transactionId, receiptUrl, refundReason. Indexed on `userId+createdAt`, `status+createdAt`
- **server/routes/paymentRoutes.js** (NEW, +22 lines): `POST /create-intent`, `POST /confirm`, `GET /history`, `GET /:id`, `POST /:id/refund` (all protected by `protect`)
- **client/src/App.jsx**: Added `/payment/checkout` route (RequireAuth)
- **server/server.js**: Mounted payment routes

### Testing
1. Create a booking, note the booking ID
2. Navigate to `/payment/checkout?bookingId=ID&amount=AMOUNT`
3. Select credit card, enter masked card details
4. Submit — verify processing spinner, then success with transaction ID
5. Try paying for the same booking again — verify duplicate error
6. Navigate to `/payment/history` — verify transaction appears
7. Request a refund — verify reason is stored

---

## Issue #8 — Worker Recurring Schedule & Time Slot Manager

**Title:** feat(worker-schedule): add recurring availability and time slot management

**Description:**
Workers need to manage their availability so customers know when they can be booked. Currently there's no schedule system. Add a weekly schedule manager where workers set recurring availability (e.g., Mon-Fri 9 AM - 5 PM), block specific time slots, and see existing bookings on their calendar.

**Requirements:**
- `ScheduleManager.jsx` — weekly calendar grid (8 AM - 7 PM), 7-column layout
- Week navigation (prev/next) with date range header
- Recurring day-of-week availability settings (start/end time per day)
- Block-time-slot modal with reason, date, and time range
- View existing bookings on the schedule (busy indicators)
- Fallback to empty schedule on API failure

**Acceptance Criteria:**
- Workers can set recurring availability for each day of the week
- Workers can block specific time slots with a reason
- Bookings appear on the schedule as busy blocks
- Week navigation changes the displayed date range
- Schedule state persists across page reloads

---

## PR #8 — feat(worker-schedule): add recurring availability and time slot management

Closes #8

### Changes
- **client/src/pages/worker/ScheduleManager.jsx** (NEW, +434 lines): Weekly calendar grid (7-day header, 12-row hour grid 8-19), week nav, recurring day toggles, block-time modal (date/time/reason), block removal, booking integration. Route: `/worker/schedule`
- **client/src/services/scheduleService.js** (NEW, +89 lines): `getWorkerSchedule(dateRange)`, `setRecurringAvailability(days)`, `blockTimeSlot(data)`, `getBlockedSlots(dateRange)`, `removeBlockedSlot(id)`
- **server/controllers/scheduleController.js** (NEW, +293 lines): 5 controllers — getWorkerSchedule (day-keyed with bookings + blocked slots), setRecurringAvailability (validate/save dayOfWeek/startTime/endTime array), blockTimeSlot, getBlockedSlots (date range), removeBlockedSlot
- **server/models/Worker.js** (MODIFIED, +30/-1 lines): Added `recurringAvailability: [{ dayOfWeek, startTime, endTime }]` and `blockedSlots: [{ date, startTime, endTime, reason }]`
- **server/routes/scheduleRoutes.js** (NEW, +22 lines): `GET /`, `POST /recurring`, `POST /block`, `GET /blocked`, `DELETE /block/:id` (all protected by `protectWorker`)
- **client/src/App.jsx**: Added `/worker/schedule` route
- **server/server.js**: Mounted schedule routes

### Testing
1. Login as a worker, navigate to `/worker/schedule`
2. Toggle recurring availability for Monday (9:00 - 17:00) — save
3. Navigate to next week — verify recurring days persist
4. Block a specific slot (Wed 14:00-15:00 with reason "Lunch")
5. Create a booking for this worker — verify it appears on schedule
6. Remove a blocked slot — verify it disappears

---

## Issue #9 — Admin Review Moderation Panel with Bulk Actions

**Title:** feat(moderation): add admin review moderation panel with bulk actions

**Description:**
User-submitted reviews can contain spam, inappropriate content, or false information. There's no moderation workflow. Add an admin moderation panel where reported/pending reviews are reviewed, approved, or rejected with notes, and worker ratings are automatically recalculated.

**Requirements:**
- `ModerationPanel.jsx` — stat cards (total/approved/pending/flagged counts)
- Paginated review queue with approve/reject per review
- Select-all checkbox and bulk action bar (approve/reject selected)
- Inline admin notes on rejection
- Auto-recalculate worker average rating on approval
- Review model: `reported`, `reportReason`, `reportedAt`, `moderationStatus`, `adminNote` fields

**Acceptance Criteria:**
- Admin sees moderation stats at the top (4 stat cards)
- Reviews can be individually approved/rejected
- Bulk select and bulk action works for multiple reviews
- Worker ratings are recalculated after approval
- Rejected reviews include admin notes
- Flagged reviews are highlighted in the queue

---

## PR #9 — feat(moderation): add admin review moderation panel with bulk actions

Closes #9

### Changes
- **client/src/pages/admin/ModerationPanel.jsx** (NEW, +318 lines): 4 stat cards (total/approved/pending/flagged), paginated review queue, per-review approve/reject, select-all, bulk action bar, loading spinner. Route: `/admin/moderation`
- **client/src/services/moderationService.js** (NEW, +93 lines): `getReportedReviews(page, limit, filter)`, `approveReview(id)`, `rejectReview(id, adminNote)`, `bulkAction(ids, action, adminNote)`, `getModerationStats()`
- **server/controllers/moderationController.js** (NEW, +194 lines): 5 controllers — getReportedReviews (paginated, populated), approveReview (sets approved, recalculates rating), rejectReview (sets flagged, stores note), bulkAction (batch approve/reject with rating recalculation), getModerationStats (aggregation pipeline)
- **server/models/Review.js** (MODIFIED, +5 fields, +1 method): Added `reported`, `reportReason`, `reportedAt`, `moderationStatus` (enum: approved/pending/flagged), `adminNote`; added `calculateAverageRating` static method; added `post('save')` hook for auto-recalculate; indexed on `moderationStatus+createdAt`, `worker+moderationStatus+createdAt`, `reportedAt`
- **server/routes/moderationRoutes.js** (NEW, +32 lines): `GET /reviews`, `PATCH /reviews/:id/approve`, `PATCH /reviews/:id/reject`, `POST /reviews/bulk`, `GET /stats` (all under `protect` + `requireAdmin`)
- **client/src/App.jsx**: Added `/admin/moderation` route
- **server/server.js**: Mounted moderation routes

### Testing
1. Flag a review from the frontend (set `reported` and `reportReason`)
2. Login as admin, navigate to `/admin/moderation`
3. Verify stat cards show correct counts
4. Approve a pending review — verify rating recalculates
5. Reject a review with note — verify note stored, review shows as flagged
6. Select multiple reviews, use bulk approve — verify all update

---

## Issue #10 — Worker Earnings Tracking Dashboard with Payouts

**Title:** feat(worker-earnings): add earnings tracking dashboard with payout history

**Description:**
Workers have no visibility into their earnings. They can't see how much they've earned, how much is pending, or request payouts. Add a dashboard where workers can track their earnings with stat cards, paginated history, and a payout request system.

**Requirements:**
- `EarningsDashboard.jsx` — 5 stat cards (total, pending, paid, this month, booking count)
- Paginated earnings history table with status badges (paid/pending/refunded)
- Platform fee breakdown and net amount per earning
- Payout request with balance validation
- Mock data fallback when API is unavailable
- `Earning.js` model with workerId, amount, platformFee, netAmount, status, payoutDate

**Acceptance Criteria:**
- Dashboard shows accurate aggregated stats from actual earnings data
- Earnings history is paginated and filterable by status
- Each row shows amount, platform fee, net amount, and payout date
- Payout request validates sufficient balance before processing
- Fallback mock data displays when API is unreachable

---

## PR #10 — feat(worker-earnings): add earnings tracking dashboard with payout history

Closes #10

### Changes
- **client/src/pages/worker/EarningsDashboard.jsx** (NEW, +284 lines): 5 stat cards (DollarSign/Calendar/Clock/CheckCircle2/TrendingUp icons), earnings history table with status badges (paid=green, pending=yellow, refunded=red), payout request button, mock data fallback, pagination. Route: `/worker/earnings`
- **client/src/services/earningService.js** (NEW, +54 lines): `getEarningsDashboard()`, `getEarningsHistory(page, limit, status)`, `requestPayout(amount)`
- **server/controllers/earningController.js** (NEW, +184 lines): 3 controllers — getEarningsDashboard (aggregation: total, pending, paid, this month, booking count), getEarningsHistory (paginated, status filter, populated with booking), requestPayout (validate balance, mark oldest pending earnings as paid, handle partial splits)
- **server/models/Earning.js** (NEW, +55 lines): Mongoose schema — workerId, bookingId, amount, platformFee (computed as 15%), netAmount (computed), status enum (pending/paid/refunded), payoutDate, payoutMethod, description. Indexed on `workerId+createdAt`, `status`, `workerId+status+createdAt`
- **server/routes/earningRoutes.js** (NEW, +18 lines): `GET /dashboard/stats`, `GET /history`, `POST /payout` (all protected by `protectWorker`)
- **client/src/App.jsx**: Added `/worker/earnings` route
- **server/server.js**: Mounted earning routes

### Testing
1. Seed some earning records in the database for a worker
2. Login as that worker, navigate to `/worker/earnings`
3. Verify stat cards show correct totals (total, pending, paid, monthly, count)
4. Scroll through history table — verify pagination works
5. Filter by "paid" status — verify only paid earnings show
6. Request a payout — verify balance validation and payout processing
7. Disconnect backend — verify mock data fallback renders

---

## Issue #11 — Backend crash on startup: Redis version mismatch, missing dependencies, unhandled errors

**Title:** fix(backend): resolve Redis version mismatch, missing imports, and unhandled rejection crashes

**Description:**
The backend server crashes on startup with multiple errors:
1. BullMQ requires Redis >= 5.0.0 but winget installs Redis 3.0.504
2. `validateRegistrationPayload` middleware referenced but never defined in `authRoutes.js`
3. Missing `startBookingReminderScheduler` export — file exports `checkUpcomingBookings` instead
4. Missing imports for `availabilityRoutes` and `auditLogRoutes` in `server.js`
5. Mongoose queries buffer and timeout (10s) when MongoDB is unavailable instead of failing fast
6. BullMQ Worker/Queue connection failures trigger unhandled promise rejections
7. ioredis socket errors flood stderr with ECONNREFUSED stack traces
8. Frontend: `useTheme` crash because `ThemeProvider` missing from component tree
9. Frontend: duplicate `const NotFound` declaration in `App.jsx`
10. Frontend: missing closing brace in `apiClient.js` interceptor

**Requirements:**
- Add `process.on('unhandledRejection')` handler to catch BullMQ/ioredis connection errors
- Fix `authRoutes.js` — remove dead route referencing `validateRegistrationPayload`
- Fix `server.js` imports — add `availabilityRoutes`, `auditLogRoutes`; fix `bookingReminderWorker` export name
- Make `connectDB` set `bufferCommands: false` so queries fail fast without MongoDB
- Add `isDbConnected()` guard in all worker files to skip when MongoDB is offline
- Make Redis connection lazy in `queue.js` — only initialize on first use
- Move Redis connection creation inside `startWorker()` instead of module level
- Add `retryStrategy: () => null` to all ioredis connections to prevent reconnect spam
- Wrap BullMQ Worker/Queue creation in try-catch for graceful fallback
- Frontend: wrap app with `<ThemeProvider>` in `main.jsx`
- Frontend: remove duplicate `NotFound` import
- Frontend: fix missing closing brace in `apiClient.js`

**Acceptance Criteria:**
- Backend starts without crashing even when Redis and MongoDB are unavailable
- All BullMQ workers gracefully skip initialization when Redis is offline
- No unhandled promise rejections or uncaught exceptions on startup
- Frontend renders without crashing (no `useTheme` error)
- Server responds to health check on port 5000
- When Redis >= 5.0 is available, BullMQ workers connect and function normally

---

## PR #11 — fix(backend): resolve Redis version mismatch, missing imports, and unhandled rejection crashes

Closes #11

### Changes

**Backend crash fixes (7 files):**

- **server/server.js** (MODIFIED): Added `process.on('unhandledRejection')` handler to suppress BullMQ/ioredis connection errors. Added missing `import availabilityRoutes` and `import auditLogRoutes`. Fixed import `startBookingReminderScheduler` → `checkUpcomingBookings` and added `setInterval`-based scheduler fallback.

- **server/config/db.js** (MODIFIED): Added `mongoose.set('bufferCommands', false)` and `serverSelectionTimeoutMS: 5000` / `connectTimeoutMS: 5000` so operations fail fast instead of buffering for 10s when MongoDB is unavailable.

- **server/routes/authRoutes.js** (MODIFIED): Removed duplicate `router.post('/register', ...)` line that referenced non-existent `validateRegistrationPayload` middleware.

- **server/workers/bookingExpiryWorker.js** (MODIFIED): Added `isDbConnected()` guard — skips initialization when MongoDB is offline. Wrapped `performExpiryCheck` MongoDB operations in try-catch. Added `retryStrategy: () => null` to ioredis connection.

- **server/workers/bookingReminderWorker.js** (MODIFIED): Added `isDbConnected()` guard. Wrapped all MongoDB queries and notification sends in try-catch.

- **server/workers/notificationWorker.js** (MODIFIED): Moved Redis connection creation from module level into `startWorker()` function (lazy init). Wrapped `new IORedis()` and `new Worker()` in try-catch for graceful fallback. Added `retryStrategy: () => null`. Silenced ioredis error events with no-op handler.

- **server/utils/queue.js** (MODIFIED): Made Redis connection lazy via `getRedisConnection()` and Queue creation lazy via `getNotificationQueue()`. Added `retryStrategy: () => null`. Prevented module-level connection attempts.

**Frontend crash fixes (3 files):**

- **client/src/main.jsx** (MODIFIED): Added `import { ThemeProvider }` and wrapped `<ThemeProvider>` around `<App>` in the component tree to fix `useTheme must be used within a ThemeProvider` crash.

- **client/src/App.jsx** (MODIFIED): Removed duplicate `const NotFound = lazy(() => import('./pages/NotFound'))` declaration (line 48).

- **client/src/services/apiClient.js** (MODIFIED): Added missing closing `}` after the CSRF token `if` block to fix esbuild parse error `Unexpected ","`.

### Files Changed
```
client/src/App.jsx                      |  1 -
client/src/main.jsx                     |  9 +++--
client/src/services/apiClient.js        |  1 +
server/config/db.js                     |  7 +++-
server/routes/authRoutes.js             |  1 -
server/server.js                        | 16 +++++++-
server/utils/queue.js                   | 67 +++++++++++++++----------
server/workers/bookingExpiryWorker.js   | 37 +++++++++-------
server/workers/bookingReminderWorker.js | 42 +++++++++++------
server/workers/notificationWorker.js    | 36 ++++++++--------
10 files changed, 139 insertions(+), 78 deletions(-)
```

### Running a Compatible Redis Version on Windows

The old Redis 3.0 (from `winget install Redis`) is incompatible — BullMQ requires >= 5.0.0. Options:

**Option A — Docker (recommended):**
```bash
# Start Docker Desktop first, then:
docker run -d -p 6379:6379 --name fixnearby-redis redis:7
```

**Option B — Memurai (Windows-native, Redis-compatible):**
```bash
# Download from https://www.memurai.com/
winget install Memurai.Memurai
```

**Option C — WSL2:**
```bash
wsl --install -d Ubuntu
wsl sudo apt install redis-server
wsl redis-server
```

### Testing
1. `cd server && npm run dev` — server starts on port 5000 without Redis or MongoDB
2. `curl http://localhost:5000/api/health` — returns `{ status: 'success', message: 'FixNearby API is running' }`
3. `cd client && npm run dev` — frontend renders without crash overlay
4. Start Redis via Docker/Memurai, restart backend — verify `[Worker] Notification background worker listening...` shows Redis is connected
5. Start MongoDB, restart backend — verify `[BullMQ Expiry Worker]: Registered BullMQ consumer.` shows worker is active

---

## Issue #12 — Worker Trust Rating & Aggregated Feedback Metrics Engine

**Title:** feat(reviews): implement worker trust rating system with karma score and aggregated feedback metrics

**Description:**
Build a system that allows users to leave reviews and ratings for workers after booking completion, and automatically calculates dynamic worker metrics (e.g. completion rate, average rating, a weighted karma score, and interactive chat-integrated review tools).

**Requirements:**
- Create a Review mongoose schema representing user feedback for completed bookings (rating 1-5, review text, booking reference).
- Restrict review submission only to users who have completed bookings with that specific worker.
- Use mongoose post-save hooks to automatically recalculate and update a worker's overall rating (averageRating, reviewCount) inside the Worker document.
- Design a background algorithm that updates a worker's 'Karma/Reliability Score' weekly based on: completion rate (completed vs cancelled bookings), responsiveness, and average ratings.
- Integrate Chat Review Modal into the active chat window to allow feedback submission directly inside the chat flow.
- Add Reputation Card popover on the rating pill within the chat header showing the worker's key performance metrics.

**Acceptance Criteria:**
- Submitting a review for a non-completed booking returns 400.
- Duplicate review submissions for the same booking return 400.
- averageRating on Worker document updates automatically inside the same request cycle after a review is created.
- karmaScore updates weekly via automated background worker.
- Chat Review Modal opens properly and allows submitting a 5-star rating and description text.
- Clicking the rating pill inside the chat header opens the Reputation Card dropdown popover correctly.

---

## PR #12 — feat(reviews): implement worker trust rating system with karma score and aggregated feedback metrics

Closes #12

### Changes

- **client/src/components/ChatWindow.jsx** (MODIFIED, +120 lines): Integrated "Leave Feedback" button, interactive Chat Review Modal overlays, rating pill buttons, and dynamic Reputation Card popover panel.
- **server/models/Review.js** (NEW, +95 lines): Mongoose schema with all rating fields, `calculateAverageRating` static method, and post-save recalculation hook.
- **server/controllers/reviewController.js** (NEW, +404 lines): Completed reviews handlers including Completed booking status gates, user-ownership checks, duplicate checks, AI toxicity filtering, and public query scopes.
- **server/routes/reviewRoutes.js** (NEW, +28 lines): Review API endpoints exposing CRUD review actions, booking review creation helper, and report action routes.
- **server/workers/karmaWorker.js** (NEW, +80 lines): Weekly background interval worker that aggregates worker bookings, computes karma score, and sets reliability tiers.

### Testing
1. Navigate to `/chat` and click "Leave Feedback" in the header -> verify feedback modal opens.
2. Submit a review -> verify response status is successful and the worker's average rating updates in the database.
3. Click on the rating pill next to the worker's name -> verify the Reputation Card popover displays with verified metrics.
4. Try to submit a duplicate review for the same booking reference ID -> verify it is blocked.

