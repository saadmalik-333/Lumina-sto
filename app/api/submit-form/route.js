import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force Node.js runtime for Nodemailer compatibility
export const runtime = 'nodejs';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Flow:
 * 1. Validate Payload
 * 2. Persist to Supabase (High Priority)
 * 3. Dispatch Notification (Background Task with Timeout)
 */

export async function POST(req) {
  const transactionId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [${transactionId}] --- NEW SUBMISSION RECEIVED ---`);

  try {
    // 1. Parse Request
    const body = await req.json();
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    // 2. Strict Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${transactionId}] Validation Failed: Missing required fields.`);
      return NextResponse.json({ 
        success: false, 
        error: "Critical fields (Name, Email, Details, ID) are missing." 
      }, { status: 400 });
    }

    // 3. Supabase Database Sync
    console.log(`[${transactionId}] DB Sync: Initializing Cloud Connection...`);
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
        created_at: timestamp
      }
    ]);

    if (dbError) {
      console.error(`[${transactionId}] DB Sync Error:`, dbError.message);
      throw new Error(`Cloud DB failure: ${dbError.message}`);
    }
    console.log(`[${transactionId}] DB Sync: Success. Record ${requestId} created.`);

    // 4. Notification (Wrapped in a timeout race to prevent frontend hang)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''); // Strip spaces
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      console.log(`[${transactionId}] Notification: Attempting SMTP dispatch...`);
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailPass },
      });

      const mailOptions = {
        from: `"Lumina Studio" <${gmailUser}>`,
        to: adminEmail,
        subject: `NEW BRIEF: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 25px; border: 1px solid #f1f5f9; border-radius: 20px; color: #1e293b;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Project Inquiry: ${requestId}</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <p><strong>Client:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Budget:</strong> ${budgetRange}</p>
            </div>
            <p><strong>The Brief:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${projectDetails}</p>
          </div>
        `,
      };

      try {
        // We race the email against a 6-second timeout
        await Promise.race([
          transporter.sendMail(mailOptions),
          new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP_TIMEOUT')), 6000))
        ]);
        console.log(`[${transactionId}] Notification: Admin email sent.`);
      } catch (emailErr) {
        console.warn(`[${transactionId}] Notification: Email failed or timed out, but DB sync was successful.`);
      }
    } else {
      console.warn(`[${transactionId}] Notification: Skipped. Check ENV variables.`);
    }

    console.log(`[${transactionId}] --- SUBMISSION COMPLETED SUCCESSFULLY ---`);
    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully",
      requestId 
    }, { status: 200 });

  } catch (err) {
    console.error(`[${transactionId}] CRITICAL FAILURE:`, err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "An internal error occurred." 
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
 * Method Not Allowed Handlers
 */
export async function GET() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
