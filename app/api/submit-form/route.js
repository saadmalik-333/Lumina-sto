import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force Node.js runtime to ensure Nodemailer/SMTP works correctly in serverless
export const runtime = 'nodejs';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Process Flow:
 * 1. Validate JSON Payload
 * 2. Persist Project Data to Supabase (using Service Role Key)
 * 3. Dispatch Notification via Gmail SMTP
 * 4. Return Unified JSON Response
 */

export async function POST(req) {
  const tId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const now = new Date().toISOString();
  
  console.log(`[${now}] [${tId}] --- INCOMING FORM SUBMISSION ---`);

  try {
    // 1. Parse Payload
    const body = await req.json();
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    console.log(`[${tId}] Validating data for Request ID: ${requestId}`);

    // 2. Data Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${tId}] Validation Error: Required fields missing in payload.`);
      return NextResponse.json({ 
        success: false, 
        error: "Mandatory project details are missing." 
      }, { status: 400 });
    }

    // 3. Supabase Integration (Using Service Role Key to ensure persistence)
    console.log(`[${tId}] Cloud DB: Synchronizing record...`);
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${tId}] Configuration Error: Supabase credentials missing from ENV.`);
      throw new Error("Database uplink configuration is missing.");
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
      console.error(`[${tId}] Cloud DB Sync Error: ${dbError.message}`);
      throw new Error(`Database synchronization failed: ${dbError.message}`);
    }
    console.log(`[${tId}] Cloud DB Sync: Success.`);

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
        from: `"Lumina Creative Studio" <${gmailUser}>`,
        to: adminEmail,
        subject: `[NEW BRIEF] ${fullName} - ${requestId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">LUMINA STUDIO</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 5px;">New Project Opportunity</p>
            </div>
            <div style="background: #f8fafc; padding: 25px; border-radius: 16px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px;"><strong>Workspace ID:</strong> ${requestId}</p>
              <p style="margin: 0 0 10px;"><strong>Client:</strong> ${fullName}</p>
              <p style="margin: 0 0 10px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0 0 10px;"><strong>Service Domain:</strong> ${service}</p>
              <p style="margin: 0;"><strong>Budget Scope:</strong> ${budgetRange}</p>
            </div>
            <p style="font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Creative Brief</p>
            <div style="font-size: 15px; color: #475569; white-space: pre-wrap; font-style: italic; background: #fff; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px;">"${projectDetails}"</div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 40px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">Automated notification from Lumina Admin Suite</p>
          </div>
        `,
      };

      try {
        // Await dispatch to ensure serverless function doesn't terminate early
        const info = await transporter.sendMail(mailOptions);
        console.log(`[${tId}] SMTP: Success. Notification delivered (ID: ${info.messageId}).`);
      } catch (emailErr) {
        console.warn(`[${tId}] SMTP Warning: Notification relay failed, but project is secured in DB. Error: ${emailErr.message}`);
        // We do not fail the whole request if only the email notification lags
      }
    } else {
      console.warn(`[${tId}] SMTP: Skipped. Check environment variables.`);
    }

    console.log(`[${tId}] --- SUBMISSION COMPLETED SUCCESSFULLY ---`);
    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully",
      requestId 
    }, { status: 200 });

  } catch (err) {
    console.error(`[${tId}] CRITICAL SYSTEM FAILURE:`, err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "An unexpected error occurred during the uplink sync." 
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
