/**
 * DEPRECATED: Relocated to /app/api/submit-form/route.js
 * Returning 410 Gone to signal the move.
 */
export default function handler(req, res) {
  res.status(410).json({ 
    success: false, 
    error: "Endpoint relocated to /app/api/submit-form/route.js" 
  });
}