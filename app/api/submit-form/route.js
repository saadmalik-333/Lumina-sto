import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Handles project inquiries:
 * 1. Validates the incoming project data.
 * 2. Persists the inquiry to Supabase.
 * 3. Notifies the admin via Gmail SMTP.
 */

export async function POST(req) {
  console.log("--- [START] API Submission Triggered ---");
  
  try {
    const body = await req.json();
    console.log("Payload received:", body);

    const {
      fullName,
      email,
      projectDetails,
      service,
      budgetRange,
      deadline,
      requestId
    } = body;

    // 1. Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error("Validation Error: Missing mandatory fields.");
      return NextResponse.json({ 
        success: false, 
        error: "Mandatory fields are missing." 
      }, { status: 400 });
    }

    // 2. Database Sync
    console.log("Database Sync: Connecting to Supabase...");
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
      console.error("Supabase Error:", dbError.message);
      throw new Error(`DB Sync Failed: ${dbError.message}`);
    }
    console.log("Database Sync: Record created successfully.");

    // 3. Email Notification
    console.log("Notification: Initializing SMTP relay...");
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.ADMIN_EMAIL) {
      console.warn("Notification: SMTP Credentials missing from environment. Skipping email.");
    } else {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"Lumina Platform" <${process.env.GMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `NEW INQUIRY: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">New Project Request</h2>
            <p><strong>ID:</strong> ${requestId}</p>
            <p><strong>Client:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Budget:</strong> ${budgetRange}</p>
            <p><strong>Deadline:</strong> ${deadline}</p>
            <hr />
            <p><strong>Details:</strong></p>
            <p style="white-space: pre-wrap;">${projectDetails}</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Notification: Admin email dispatched.");
    }

    console.log("--- [END] Submission Process Complete ---");
    return NextResponse.json({ success: true, requestId }, { status: 200 });

  } catch (err) {
    console.error("CRITICAL API ERROR:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}