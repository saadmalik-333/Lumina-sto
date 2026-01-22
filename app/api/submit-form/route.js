
import { NextResponse } from 'next/server';

/**
 * NEXT.JS APP ROUTER API
 * Path: /app/api/submit-form/route.js
 */

export async function GET() {
  return NextResponse.json(
    { 
      ok: true, 
      message: "API is alive",
      router: "App Router",
      method: "GET",
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    { 
      ok: true, 
      message: "API is alive",
      router: "App Router",
      method: "POST",
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

// Ensure other methods return a clean response
export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
