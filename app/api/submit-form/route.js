import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * Path: /api/submit-form
 * 
 * Handles project inquiries by:
 * 1. Validating the incoming project data.
 * 2. Persisting the inquiry to the Supabase database.
 * 3. Notifying the admin via a Gmail-powered SMTP relay.
 */

export async function POST(req) {
  console.log("--- [START] Form Submission API Trace ---");
  
  try {
    // 1. Extract and log JSON body
    const body = await req.json();
    console.log("Data received:", body);

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
    if (!fullName || !email || !projectDetails) {
      console.error("API Error: Missing core project fields.");
      return NextResponse.json({ 
        success: false, 
        error: "Required fields (fullName, email, projectDetails) are missing." 
      }, { status: 400 });
    }

    // 3. Database Operation: Supabase Insertion
    // Using service role key to ensure successful insertion regardless of RLS constraints.
    console.log("Step 1/2: Connecting to Supabase...");
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
      console.error("Supabase Database Failure:", dbError.message);
      // Throw to be handled by the main catch block
      throw new Error(`Cloud Database Error: ${dbError.message}`);
    }
    console.log("Step 1/2: Supabase record synchronized.");

    // 4. Notification Operation: Nodemailer (SMTP)
    console.log("Step 2/2: Initializing Nodemailer SMTP relay...");
    
    // Check if variables are present to avoid runtime errors
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.ADMIN_EMAIL) {
      console.error("Configuration Error: SMTP credentials missing in environment.");
      throw new Error("Server misconfigured: Email credentials missing.");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Lumina Studio System" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `NEW PROJECT BRIEF: ${fullName} (${requestId})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; color: #0f172a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0; letter-spacing: -0.025em;">LUMINA CREATIVE STUDIO</h1>
            <p style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Inbound Client Inquiry</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <p style="margin: 0 0 12px 0; font-size: 14px;"><strong style="color: #4f46e5;">Request ID:</strong> ${requestId}</p>
            <p style="margin: 0 0 12px 0; font-size: 14px;"><strong style="color: #4f46e5;">Client:</strong> ${fullName}</p>
            <p style="margin: 0 0 12px 0; font-size: 14px;"><strong style="color: #4f46e5;">Email:</strong> ${email}</p>
            <p style="margin: 0 0 12px 0; font-size: 14px;"><strong style="color: #4f46e5;">Service Category:</strong> ${service}</p>
            <p style="margin: 0 0 12px 0; font-size: 14px;"><strong style="color: #4f46e5;">Financial Tier:</strong> ${budgetRange}</p>
            <p style="margin: 0; font-size: 14px;"><strong style="color: #4f46e5;">Deadline:</strong> ${deadline}</p>
          </div>

          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 12px;">The Creative Brief</h3>
            <div style="font-size: 16px; line-height: 1.6; color: #334155; font-style: italic; border-left: 4px solid #4f46e5; padding-left: 20px;">
              ${projectDetails.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 32px; text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">This email was generated by the Lumina Platform API.</p>
          </div>
        </div>
      `,
    };

    console.log(`Step 2/2: Transmitting email to ${process.env.ADMIN_EMAIL}...`);
    await transporter.sendMail(mailOptions);
    console.log("Step 2/2: SMTP transmission successful.");

    // 5. Finalize response
    console.log("--- [END] Inquiry Successfully Processed ---");
    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully" 
    }, { status: 200 });

  } catch (err) {
    console.error("CRITICAL API FAILURE:", err.message);
    
    // Determine status code based on error context
    let statusCode = 500;
    if (err.message.includes("Required fields")) statusCode = 400;

    return NextResponse.json({ 
      success: false, 
      error: err.message || "Internal server error" 
    }, { status: statusCode });
  }
}

/**
 * Handle OPTIONS preflight requests for CORS
 */
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

/**
 * Block unsupported methods
 */
export async function GET() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}