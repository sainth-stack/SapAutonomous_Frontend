/**
 * Parse interval strings from Job / Application configuration (e.g. "15m", "1h", "30s", "10 min").
 * @param {string|null|undefined} text
 * @param {number} defaultMs - used when empty or unparseable
 * @returns {number} milliseconds (minimum 5000)
 */
export function parseIntervalToMs(text, defaultMs = 60000) {
  const floor = 5000;
  if (text == null || String(text).trim() === "") {
    return Math.max(floor, defaultMs);
  }
  const raw = String(text).trim().toLowerCase();
  const m = raw.match(
    /^(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours)?$/i
  );
  if (!m) {
    return Math.max(floor, defaultMs);
  }
  const n = parseFloat(m[1], 10);
  if (Number.isNaN(n) || n <= 0) {
    return Math.max(floor, defaultMs);
  }
  const u = (m[2] || "m").toLowerCase();
  let ms;
  if (u.startsWith("s")) ms = n * 1000;
  else if (u.startsWith("m")) ms = n * 60 * 1000;
  else if (u.startsWith("h")) ms = n * 60 * 60 * 1000;
  else ms = n * 60 * 1000;
  return Math.max(floor, ms);
}
