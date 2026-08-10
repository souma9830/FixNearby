const escapeIcsText = (value = '') => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/\r?\n/g, '\\n')
  .replace(/,/g, '\\,')
  .replace(/;/g, '\\;');

const toIcsTimestamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError('Booking has no valid scheduled time');
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

export const createBookingCalendarEvent = (booking, now = new Date()) => {
  const startValue = booking.scheduledTime || booking.scheduledDate || booking.date;
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) throw new TypeError('Booking has no valid scheduled time');
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const bookingId = booking.id || booking._id || 'booking';
  const service = booking.service || 'Service appointment';
  const worker = booking.worker || 'FixNearby professional';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FixNearby//Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(bookingId)}@fixnearby`,
    `DTSTAMP:${toIcsTimestamp(now)}`,
    `DTSTART:${toIcsTimestamp(start)}`,
    `DTEND:${toIcsTimestamp(end)}`,
    `SUMMARY:${escapeIcsText(`${service} with ${worker}`)}`,
    `DESCRIPTION:${escapeIcsText(`FixNearby booking ${bookingId}. Status: ${booking.status || 'Scheduled'}.`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
};

export const downloadBookingCalendarEvent = (booking) => {
  const content = createBookingCalendarEvent(booking);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fixnearby-booking-${booking.id || booking._id || 'appointment'}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
