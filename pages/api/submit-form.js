/**
 * MINIMAL DEBUG API ROUTE
 * Use this to verify that your Next.js API routing is reachable from the frontend.
 * This version removes all external dependencies (Supabase, Resend) to isolate connectivity issues.
 */
export default function handler(req, res) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Return a simple success message immediately regardless of the request method or body
  return res.status(200).json({
    ok: true,
    message: "API is alive"
  });
}