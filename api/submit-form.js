/**
 * DEPRECATED: Relocated to /app/api/submit-form/route.js
 * This file is removed to ensure Next.js App Router takes precedence.
 */
export default function handler(req, res) {
  res.status(410).json({ error: "Endpoint relocated to /app/api/submit-form" });
}
