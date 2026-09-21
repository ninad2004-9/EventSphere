/**
 * Generate a unique booking reference.
 * Format: ES-YYYYMMDD-XXXXXX  (e.g. ES-20260921-A8F42K)
 */
const generateBookingRef = () => {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `ES-${datePart}-${rand}`;
};

module.exports = { generateBookingRef };
