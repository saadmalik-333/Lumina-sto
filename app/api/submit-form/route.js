import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force Node.js runtime for Nodemailer/SMTP compatibility
export const runtime = 'nodejs';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 */
export async function POST(req) {
  const tId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const now = new Date().toISOString();
  
  console.log(`[${now}] [${tId}] --- API INVOCATION: FORM SUBMISSION ---`);

  try {
    // 1. Parse Payload
    const body = await req.json();
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    console.log(`[${tId}] Received Request ID: ${requestId} from ${email}`);

    // 2. Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${tId}] Validation Error: Required fields missing.`);
      return NextResponse.json({ 
        success: false, 
        error: "Mandatory project fields are missing." 
      }, { status: 400 });
    }

    // 3. Supabase Integration (Service Role for bypass RLS)
    console.log(`[${tId}] DB Sync: Connecting to Supabase...`);
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
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
        created_at: now
      }
    ]);

    if (dbError) {
      console.error(`[${tId}] DB Error: ${dbError.message}`);
      throw new Error(`Cloud Database Sync Failed: ${dbError.message}`);
    }
    console.log(`[${tId}] DB Sync: Success. Record persistent.`);

    // 4. Admin Notification (Nodemailer SMTP)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      console.log(`[${tId}] SMTP: Preparing dispatch via ${gmailUser}...`);
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailPass },
      });

      const mailOptions = {
        from: `"Lumina System" <${gmailUser}>`,
        to: adminEmail,
        subject: `[NEW PROJECT] ${fullName} - ${requestId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 30px; border: 1px solid #f1f5f9; border-radius: 24px; color: #1e293b;">
            <h2 style="color: #4f46e5; margin-bottom: 24px;">New Creative Brief Received</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 24px;">
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Client:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Budget:</strong> ${budgetRange}</p>
            </div>
            <p><strong>Project Details:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #475569;">${projectDetails}</p>
          </div>
        `,
      };

      try {
        // Await email dispatch to prevent function termination
        const info = await transporter.sendMail(mailOptions);
        console.log(`[${tId}] SMTP: Success. Message ID: ${info.messageId}`);
      } catch (emailErr) {
        console.warn(`[${tId}] SMTP Warning: Notification delayed. ${emailErr.message}`);
        // Do not throw here so user gets success for the DB record
      }
    } else {
      console.warn(`[${tId}] SMTP Skip: Missing environment configuration.`);
    }

    console.log(`[${tId}] --- SUBMISSION COMPLETED SUCCESSFULLY ---`);
    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully",
      requestId 
    }, { status: 200 });

  } catch (err) {
    console.error(`[${tId}] CRITICAL SYSTEM ERROR:`, err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Uplink synchronization failed." 
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
 * Method Not Allowed
 */
export async function GET() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
