
/**
 * NEXT.JS PAGES ROUTER API
 * Path: /pages/api/submit-form.js
 */
export default function handler(req, res) {
  // Set JSON header explicitly
  res.setHeader('Content-Type', 'application/json');

  // Support both GET and POST
  if (req.method === 'GET' || req.method === 'POST') {
    return res.status(200).json({
      ok: true,
      message: "API is alive",
      router: "Pages Router",
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Handle unsupported methods
  return res.status(405).json({
    ok: false,
    message: "Method Not Allowed"
  });
}
