import assert from 'node:assert/strict';
import { createBookingCalendarEvent } from '../src/utils/bookingCalendar.js';

const calendar = createBookingCalendarEvent({
  id: 'booking-42',
  service: 'Repair, wiring',
  worker: 'Asha; Electrician',
  status: 'Confirmed',
  scheduledTime: '2026-08-04T10:30:00.000Z',
}, new Date('2026-08-03T08:00:00.000Z'));

assert.match(calendar, /UID:booking-42@fixnearby/);
assert.match(calendar, /DTSTAMP:20260803T080000Z/);
assert.match(calendar, /DTSTART:20260804T103000Z/);
assert.match(calendar, /DTEND:20260804T113000Z/);
assert.match(calendar, /SUMMARY:Repair\\, wiring with Asha\\; Electrician/);
assert.ok(calendar.endsWith('\r\n'));
assert.throws(
  () => createBookingCalendarEvent({ id: 'missing-date' }),
  /valid scheduled time/,
);

console.log('Booking calendar verification passed');
