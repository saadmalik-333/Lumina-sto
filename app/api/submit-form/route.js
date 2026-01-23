import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force Node.js runtime to ensure Nodemailer works correctly in serverless
export const runtime = 'nodejs';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Logic:
 * 1. Validate payload.
 * 2. Sync to Supabase.
 * 3. Dispatch Gmail notification.
 * 4. Return unified JSON.
 */

export async function POST(req) {
  const tId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const now = new Date().toISOString();
  
  console.log(`[${now}] [${tId}] --- FORM SUBMISSION START ---`);

  try {
    // 1. Parse JSON
    const body = await req.json();
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    console.log(`[${tId}] Data:`, JSON.stringify({ fullName, email, service, requestId }));

    // 2. Validate
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${tId}] Error: Missing fields`);
      return NextResponse.json({ 
        success: false, 
        error: "Missing required project information." 
      }, { status: 400 });
    }

    // 3. Supabase Integration
    console.log(`[${tId}] DB: Syncing to Cloud...`);
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
      console.error(`[${tId}] DB Error:`, dbError.message);
      throw new Error(`Database Uplink Failed: ${dbError.message}`);
    }
    console.log(`[${tId}] DB: Success.`);

    // 4. Email Dispatch via Nodemailer (Gmail SMTP)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      console.log(`[${tId}] Email: Initializing SMTP...`);
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
          <div style="font-family: sans-serif; max-width: 600px; padding: 25px; border: 1px solid #eee; border-radius: 15px;">
            <h2 style="color: #4f46e5;">Project Inquiry: ${requestId}</h2>
            <p><strong>Client:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Project Details:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${projectDetails}</p>
          </div>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[${tId}] Email: Sent (ID: ${info.messageId})`);
      } catch (emailErr) {
        console.warn(`[${tId}] Email: Failed, but DB is updated. Error: ${emailErr.message}`);
        // We don't fail the whole request if only the email notification lags
      }
    } else {
      console.warn(`[${tId}] Email: Skipped (Check Environment Variables)`);
    }

    console.log(`[${tId}] --- FORM SUBMISSION COMPLETE (SUCCESS) ---`);
    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully",
      requestId 
    }, { status: 200 });

  } catch (err) {
    console.error(`[${tId}] CRITICAL FAIL:`, err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "An unexpected error occurred during submission." 
    }, { status: 500 });
  }
}

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

export async function GET() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 }); }
