import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Handles project inquiries for Lumina Studio:
 * 1. Validates incoming payload.
 * 2. Persists data to Supabase using Service Role (Bypasses RLS).
 * 3. Dispatches notification via Gmail SMTP.
 */

export async function POST(req) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] --- INCOMING FORM SUBMISSION ---`);
  
  try {
    // 1. Parse Request Body
    const body = await req.json();
    console.log(`[${timestamp}] Payload:`, JSON.stringify(body, null, 2));

    const {
      fullName,
      email,
      projectDetails,
      service,
      budgetRange,
      deadline,
      requestId
    } = body;

    // 2. Critical Field Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${timestamp}] Validation Failed: Missing required fields.`);
      return NextResponse.json({ 
        success: false, 
        error: "Mandatory fields (Name, Email, Details, ID) are missing." 
      }, { status: 400 });
    }

    // 3. Database Operation: Supabase Sync
    console.log(`[${timestamp}] DB Sync: Initializing Supabase client...`);
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error: dbError } = await supabase.from('requests').insert([
      {
        request_id: requestId,
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        service: service || 'general',
        project_details: projectDetails.trim(),
        budget_range: budgetRange,
        deadline: deadline,
        status: 'Pending',
        created_at: timestamp
      }
    ]);

    if (dbError) {
      console.error(`[${timestamp}] DB Sync Error:`, dbError.message);
      throw new Error(`Database synchronization failed: ${dbError.message}`);
    }
    console.log(`[${timestamp}] DB Sync: Successfully created record ${requestId}`);

    // 4. Notification Operation: Nodemailer (SMTP)
    console.log(`[${timestamp}] Notification: Preparing Gmail SMTP relay...`);
    
    const { GMAIL_USER, GMAIL_APP_PASSWORD, ADMIN_EMAIL } = process.env;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !ADMIN_EMAIL) {
      console.warn(`[${timestamp}] Notification: Environment variables missing. Skipping email dispatch.`);
    } else {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"Lumina Platform" <${GMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `NEW PROJECT BRIEF: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 30px; border: 1px solid #f1f5f9; border-radius: 20px; color: #1e293b;">
            <h1 style="color: #4f46e5; margin-bottom: 20px;">Lumina Studio Inquiry</h1>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Client:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Budget:</strong> ${budgetRange}</p>
              <p><strong>Deadline:</strong> ${deadline}</p>
            </div>
            <h3 style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">The Brief</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${projectDetails}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">Sent via Lumina Creative Studio Production API</p>
          </div>
        `,
      };

      // We await the email explicitly to ensure Vercel doesn't kill the function before completion
      await transporter.sendMail(mailOptions);
      console.log(`[${timestamp}] Notification: Admin email dispatched to ${ADMIN_EMAIL}`);
    }

    console.log(`[${timestamp}] --- SUBMISSION COMPLETED SUCCESSFULLY ---`);
    return NextResponse.json({ 
      success: true, 
      requestId,
      message: "Form processed and notifications sent." 
    }, { status: 200 });

  } catch (err) {
    console.error(`[${timestamp}] CRITICAL FAILURE:`, err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "An internal error occurred while processing the request." 
    }, { status: 500 });
  }
}

/**
 * Handle CORS Preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Handle Unsupported Methods
 */
export async function GET() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function PATCH() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }