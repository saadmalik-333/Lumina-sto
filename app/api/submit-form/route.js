import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force Node.js runtime to ensure Nodemailer (SMTP) works correctly in serverless
export const runtime = 'nodejs';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Flow:
 * 1. Validate incoming JSON payload.
 * 2. Persist data to Supabase using Service Role Key.
 * 3. Dispatch admin notification via Gmail SMTP.
 * 4. Return standard JSON response to frontend.
 */

export async function POST(req) {
  const transactionId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [${transactionId}] --- NEW SUBMISSION RECEIVED ---`);

  try {
    // 1. Parse Request Body
    const body = await req.json();
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    console.log(`[${transactionId}] Payload:`, JSON.stringify(body));

    // 2. Strict Field Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${transactionId}] Error: Missing mandatory fields.`);
      return NextResponse.json({ 
        success: false, 
        error: "Critical fields are missing (Name, Email, Details, or ID)." 
      }, { status: 400 });
    }

    // 3. Supabase Database Insertion
    console.log(`[${transactionId}] DB Operation: Connecting to Supabase...`);
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${transactionId}] Config Error: Supabase credentials missing.`);
      throw new Error("Server-side database configuration is missing.");
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
        created_at: timestamp
      }
    ]);

    if (dbError) {
      console.error(`[${transactionId}] DB Sync Failed:`, dbError.message);
      throw new Error(`Database Insertion Error: ${dbError.message}`);
    }
    console.log(`[${transactionId}] DB Sync: Success. Record ${requestId} created.`);

    // 4. Email Notification via NodeMailer (SMTP)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''); // Ensure no spaces in App Password
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      console.log(`[${transactionId}] Email Operation: Initializing SMTP...`);
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL/TLS
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const mailOptions = {
        from: `"Lumina Studio" <${gmailUser}>`,
        to: adminEmail,
        subject: `NEW PROJECT INQUIRY: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h1 style="color: #4f46e5; font-size: 20px;">New Project Brief</h1>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>ID:</strong> ${requestId}</p>
              <p><strong>Client:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Budget:</strong> ${budgetRange}</p>
            </div>
            <p><strong>Details:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${projectDetails}</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="font-size: 11px; color: #94a3b8;">System notification from Lumina Creative Studio</p>
          </div>
        `,
      };

      // Await the email send to ensure the function doesn't terminate early
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[${transactionId}] Email Success: Message sent (ID: ${info.messageId})`);
      } catch (emailErr) {
        console.warn(`[${transactionId}] Email Warning: SMTP failed, but DB record is safe. Error: ${emailErr.message}`);
        // We don't throw here to avoid failing the whole request if only the email notification lags
      }
    } else {
      console.warn(`[${transactionId}] Email Skip: Credentials missing from environment.`);
    }

    console.log(`[${transactionId}] --- REQUEST COMPLETED SUCCESSFULLY ---`);
    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully",
      requestId 
    }, { status: 200 });

  } catch (err) {
    console.error(`[${transactionId}] CRITICAL ERROR:`, err.message);
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
 * Method Not Allowed Handlers
 */
export async function GET() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
