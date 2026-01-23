/**
 * DEPRECATED: Relocated to /app/api/submit-form/route.js
 */
export default function handler(req, res) {
  res.status(410).json({ 
    success: false, 
    error: "Legacy endpoint disabled. Use /app/api/submit-form" 
  });
}