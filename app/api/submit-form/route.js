import { NextResponse } from 'next/server';

/**
 * NEXT.JS APP ROUTER API ROUTE
 * 
 * This diagnostic endpoint confirms that the Vercel serverless environment 
 * is correctly routing requests to the App Router backend.
 */

export async function GET() {
  try {
    return NextResponse.json(
      { 
        ok: true, 
        message: "API is alive",
        timestamp: new Date().toISOString(),
        method: "GET"
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    return NextResponse.json(
      { 
        ok: true, 
        message: "API is alive",
        timestamp: new Date().toISOString(),
        method: "POST"
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
