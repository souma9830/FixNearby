/**
 * Timezone & Daylight Saving Time (DST) Normalization Utilities
 */

export const normalizeDateToUtc = (dateString, timezone = 'UTC') => {
  if (!dateString) return new Date().toISOString();
  const date = new Date(dateString);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
};

export const checkSlotAvailabilityInUtc = (slotStartUtc, slotEndUtc, workerScheduleUtc = []) => {
  const startMs = new Date(slotStartUtc).getTime();
  const endMs = new Date(slotEndUtc).getTime();

  return !workerScheduleUtc.some((bookedSlot) => {
    const bStartMs = new Date(bookedSlot.startTime).getTime();
    const bEndMs = new Date(bookedSlot.endTime).getTime();
    return startMs < bEndMs && endMs > bStartMs;
  });
};
