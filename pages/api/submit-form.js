/**
 * REDUNDANT PAGES ROUTER API
 * This file is disabled in favor of /app/api/submit-form/route.js
 */
export default function handler(req, res) {
  res.status(404).json({ success: false, error: "Route relocated to /app/api/submit-form/route.js" });
}
