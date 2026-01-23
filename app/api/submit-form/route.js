import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Logic Flow:
 * 1. Validate mandatory project data.
 * 2. Sync to Supabase using Service Role (bypasses RLS).
 * 3. Send email notification via Gmail SMTP.
 */

export async function POST(req) {
  const logPrefix = `[API ${new Date().toISOString()}]`;
  console.log(`${logPrefix} --- START Form Submission ---`);
  
  try {
    const body = await req.json();
    console.log(`${logPrefix} Received Payload:`, JSON.stringify(body, null, 2));

    const {
      fullName,
      email,
      projectDetails,
      service,
      budgetRange,
      deadline,
      requestId
    } = body;

    // 1. Mandatory Field Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`${logPrefix} Validation Failed: Missing core fields.`);
      return NextResponse.json({ 
        success: false, 
        error: "Required fields (fullName, email, projectDetails, requestId) are missing." 
      }, { status: 400 });
    }

    // 2. Database Operation: Supabase Insertion
    console.log(`${logPrefix} DB Sync: Connecting to Supabase...`);
    
    // Validate Env Vars
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`${logPrefix} DB Sync Error: Environment variables missing.`);
      throw new Error("Cloud Database configuration missing on server.");
    }

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
        created_at: new Date().toISOString()
      }
    ]);

    if (dbError) {
      console.error(`${logPrefix} DB Sync Failure:`, dbError.message);
      throw new Error(`Database error: ${dbError.message}`);
    }
    console.log(`${logPrefix} DB Sync Success: Record ${requestId} created.`);

    // 3. Notification Operation: Nodemailer (SMTP)
    console.log(`${logPrefix} Emailing: Initializing Gmail SMTP relay...`);
    
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''); // Ensure no spaces
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!gmailUser || !gmailPass || !adminEmail) {
      console.warn(`${logPrefix} Email Skip: SMTP credentials (GMAIL_USER, GMAIL_APP_PASSWORD, ADMIN_EMAIL) missing.`);
    } else {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const mailOptions = {
        from: `"Lumina Platform" <${gmailUser}>`,
        to: adminEmail,
        subject: `NEW PROJECT: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h1 style="color: #4f46e5; margin-bottom: 20px;">Project Inquiry</h1>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>ID:</strong> ${requestId}</p>
              <p><strong>Client:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Budget:</strong> ${budgetRange}</p>
              <p><strong>Deadline:</strong> ${deadline}</p>
            </div>
            <p><strong>Details:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${projectDetails}</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8;">System notification from Lumina Creative Studio</p>
          </div>
        `,
      };

      // CRITICAL: Await the send to ensure the serverless function doesn't terminate early
      const info = await transporter.sendMail(mailOptions);
      console.log(`${logPrefix} Email Success: Message sent (ID: ${info.messageId})`);
    }

    console.log(`${logPrefix} --- END Form Submission Success ---`);
    return NextResponse.json({ 
      success: true, 
      requestId,
      message: "Submission processed successfully." 
    }, { status: 200 });

  } catch (err) {
    console.error(`${logPrefix} CRITICAL API ERROR:`, err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}

/**
 * Handle CORS and Options Preflight
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
 * Block Unsupported Methods
 */
export async function GET() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
