
/**
 * VERCEL SERVERLESS FUNCTION (Node.js Runtime)
 * Path: /api/submit-form.js
 * 
 * This file must be at the root /api directory to be detected 
 * by Vercel in a non-Next.js project.
 */

export default function handler(req, res) {
  // 1. Set JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 3. Simple Diagnostic Response
  try {
    return res.status(200).json({
      ok: true,
      message: "API is alive",
      environment: "Vercel Serverless Function",
      timestamp: new Date().toISOString(),
      method: req.method
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}
