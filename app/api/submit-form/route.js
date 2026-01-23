import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force Node.js runtime to ensure Nodemailer/SMTP works correctly in serverless environments
export const runtime = 'nodejs';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Logic:
 * 1. Validate payload and log start.
 * 2. Sync project to Supabase using Service Role Key.
 * 3. Dispatch admin notification via Gmail SMTP.
 * 4. Return unified JSON response.
 */

export async function POST(req) {
  const tId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const now = new Date().toISOString();
  
  console.log(`[${now}] [${tId}] --- API INVOCATION: FORM SUBMISSION ---`);

  try {
    // 1. Parse JSON Payload
    const body = await req.json();
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    console.log(`[${tId}] Validating data for ID: ${requestId} from ${email}`);

    // 2. Data Integrity Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${tId}] Error: Client sent incomplete project data.`);
      return NextResponse.json({ 
        success: false, 
        error: "Critical project fields are missing (Name, Email, Details, or ID)." 
      }, { status: 400 });
    }

    // 3. Supabase Cloud Integration
    console.log(`[${tId}] DB: Connecting to Supabase...`);
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${tId}] Config Error: Supabase credentials missing from environment.`);
      throw new Error("System configuration error: Database uplink unavailable.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        created_at: now
      }
    ]);

    if (dbError) {
      console.error(`[${tId}] DB Failure: ${dbError.message}`);
      throw new Error(`Cloud database failed to accept record: ${dbError.message}`);
    }
    console.log(`[${tId}] DB: Success. Record persistent.`);

    // 4. Admin Notification via Nodemailer (Gmail SMTP)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      console.log(`[${tId}] SMTP: Initializing relay via ${gmailUser}...`);
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailPass },
      });

      const mailOptions = {
        from: `"Lumina Studio" <${gmailUser}>`,
        to: adminEmail,
        subject: `[NEW PROJECT BRIEF] ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 30px; border: 1px solid #f1f5f9; border-radius: 24px; color: #1e293b; line-height: 1.6;">
            <h2 style="color: #4f46e5; margin-bottom: 24px;">New Creative Lead</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Client:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Budget:</strong> ${budgetRange}</p>
            </div>
            <p><strong>Project Details:</strong></p>
            <p style="white-space: pre-wrap; color: #475569;">${projectDetails}</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">Automated notification from Lumina Admin Suite</p>
          </div>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[${tId}] SMTP: Success. Message ID: ${info.messageId}`);
      } catch (emailErr) {
        console.warn(`[${tId}] SMTP Warning: Notification failed. Error: ${emailErr.message}`);
        // Project is in DB, so we don't fail the entire request for the client
      }
    } else {
      console.warn(`[${tId}] SMTP: Skipped. Check ENV variables (GMAIL_USER, GMAIL_APP_PASSWORD, ADMIN_EMAIL).`);
    }

    console.log(`[${tId}] --- SUBMISSION LIFECYCLE COMPLETED (SUCCESS) ---`);
    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully",
      requestId 
    }, { status: 200 });

  } catch (err) {
    console.error(`[${tId}] CRITICAL SYSTEM ERROR:`, err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "An unexpected error occurred during the uplink." 
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
 * REST Method Safeguards
 */
export async function GET() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
