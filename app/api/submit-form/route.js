import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force Node.js runtime for Nodemailer/SMTP compatibility
export const runtime = 'nodejs';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * 
 * Flow:
 * 1. Receive and log submission payload.
 * 2. Validate mandatory fields.
 * 3. Persist to Supabase (using SERVICE ROLE for administrative priority).
 * 4. Dispatch Admin Notification via Gmail SMTP (Nodemailer).
 * 5. Return standard JSON success/error packet.
 */
export async function POST(req) {
  const tId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const now = new Date().toISOString();
  
  console.log(`[${now}] [${tId}] --- INBOUND PROJECT SUBMISSION ---`);

  try {
    // 1. Payload Acquisition
    const body = await req.json();
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    console.log(`[${tId}] Metadata: Client=${email}, ID=${requestId}, Service=${service}`);

    // 2. Strict Data Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${tId}] Validation Error: Client sent incomplete project profile.`);
      return NextResponse.json({ 
        success: false, 
        error: "All mandatory project fields must be populated." 
      }, { status: 400 });
    }

    // 3. Supabase Cloud Persistence
    console.log(`[${tId}] Cloud DB: Initializing connection...`);
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${tId}] Configuration Error: Supabase credentials missing from environment.`);
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
      console.error(`[${tId}] Cloud DB Failure: ${dbError.message}`);
      throw new Error(`Cloud database failed to accept record: ${dbError.message}`);
    }
    console.log(`[${tId}] Cloud DB: Success. Record ${requestId} secured.`);

    // 4. Studio Notification (Nodemailer SMTP)
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
        from: `"Lumina Creative Studio" <${gmailUser}>`,
        to: adminEmail,
        subject: `[NEW BRIEF] ${fullName} - Project ${requestId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 40px; border: 1px solid #f1f5f9; border-radius: 32px; color: #1e293b; line-height: 1.6;">
            <div style="margin-bottom: 30px; text-align: center;">
              <span style="font-size: 24px; font-weight: 900; color: #4f46e5; letter-spacing: -1px;">LUMINA STUDIO</span>
            </div>
            <h2 style="color: #0f172a; margin-bottom: 24px; font-size: 20px;">New Project Opportunity</h2>
            <div style="background: #f8fafc; padding: 25px; border-radius: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px;"><strong>Workspace ID:</strong> ${requestId}</p>
              <p style="margin: 0 0 10px;"><strong>Client:</strong> ${fullName}</p>
              <p style="margin: 0 0 10px;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 0 0 10px;"><strong>Service Domain:</strong> ${service.replace('-', ' ')}</p>
              <p style="margin: 0;"><strong>Budget Scope:</strong> ${budgetRange}</p>
            </div>
            <p style="font-weight: 700; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">The Creative Brief</p>
            <div style="font-size: 15px; color: #475569; white-space: pre-wrap; font-style: italic;">"${projectDetails}"</div>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 40px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center;">This is an automated system notification for the Lumina Administrative Portal.</p>
          </div>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[${tId}] SMTP: Notification delivered successfully (ID: ${info.messageId}).`);
      } catch (emailErr) {
        console.warn(`[${tId}] SMTP Warning: Notification relay failed. Project is secured in DB but admin may need to check dashboard. Error: ${emailErr.message}`);
      }
    } else {
      console.warn(`[${tId}] SMTP Skip: Notification service not configured in environment variables.`);
    }

    console.log(`[${tId}] --- SUBMISSION LIFECYCLE COMPLETED (SUCCESS) ---`);
    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully",
      requestId 
    }, { status: 200 });

  } catch (err) {
    console.error(`[${tId}] CRITICAL SYSTEM EXCEPTION:`, err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "The studio uplink synchronization failed." 
    }, { status: 500 });
  }
}

/**
 * Handle CORS Preflight for external integrations
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
export async function GET() { return NextResponse.json({ success: false, error: "REST method prohibited for this endpoint." }, { status: 405 }); }
export async function PUT() { return NextResponse.json({ success: false, error: "REST method prohibited for this endpoint." }, { status: 405 }); }
export async function DELETE() { return NextResponse.json({ success: false, error: "REST method prohibited for this endpoint." }, { status: 405 }); }
