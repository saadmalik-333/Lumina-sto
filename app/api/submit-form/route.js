import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form
 * Optimized for NodeMailer with Gmail/Google App Password support.
 */

export async function POST(req) {
  console.log("--- [START] NodeMailer Form Submission ---");
  
  try {
    // 1. Parse Request Body
    const body = await req.json();
    console.log("Form data received:", body);

    // 2. Destructure with Fallbacks & Sanitization
    const {
      fullName = 'Unknown Client',
      email = 'not-provided@example.com',
      projectDetails = 'No project details provided',
      service = 'General Inquiry',
      budgetRange = 'TBD',
      deadline = 'Flexible',
      requestId = `LMN-${Math.floor(1000 + Math.random() * 9000)}`
    } = body;

    // 3. Mandatory Field Validation
    if (!body.fullName || !body.email || !body.projectDetails) {
      console.warn("[Validation] Missing core fields.");
      return NextResponse.json({ 
        success: false, 
        error: 'Required fields missing: Name, Email, and Project Details are mandatory.' 
      }, { status: 400 });
    }

    // 4. Configuration Check (Server-Side Logs)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const emailPassword = process.env.EMAIL_APP_PASSWORD;

    console.log("Environment Presence Check:", {
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey,
      adminEmail: !!adminEmail,
      emailPassword: !!emailPassword
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error("[Config] Supabase environment variables are missing.");
      return NextResponse.json({ success: false, error: 'Database configuration error.' }, { status: 500 });
    }

    // 5. Database Insertion (Supabase)
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`[Database] Attempting insert for ID: ${requestId}`);

    const { error: dbError } = await supabase.from('requests').insert([
      {
        request_id: requestId,
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        service: service,
        project_details: projectDetails.trim(),
        budget_range: budgetRange,
        deadline: deadline,
        status: 'Pending',
        created_at: new Date().toISOString()
      }
    ]);

    if (dbError) {
      console.error("[Database Error] Insertion failed:", dbError.message);
    } else {
      console.log("[Database] Record synced successfully.");
    }

    // 6. Email Notification via NodeMailer (SMTP)
    let emailStatus = "skipped";
    if (adminEmail && emailPassword) {
      console.log("[Email] Configuring NodeMailer Transporter...");
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: adminEmail,
          pass: emailPassword,
        },
      });

      const mailOptions = {
        from: adminEmail,
        to: adminEmail,
        subject: `LUMINA INQUIRY: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; margin-top: 0;">New Studio Project Brief</h2>
            <p><strong>Client:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Reference ID:</strong> ${requestId}</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
              <p style="margin: 0; font-weight: bold; color: #4f46e5;">Project Vision:</p>
              <p style="margin-top: 10px;">${projectDetails}</p>
            </div>
            <p style="font-size: 11px; color: #94a3b8;">Sent via Lumina Creative Studio Backend</p>
          </div>
        `,
      };

      console.log("[Email] Payload prepared:", { to: adminEmail, subject: mailOptions.subject });

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("[Email] NodeMailer Success:", info.messageId);
        emailStatus = "success";
      } catch (mailErr) {
        console.error("[Email Error] NodeMailer failure:", mailErr.message);
        emailStatus = "failed";
      }
    } else {
      console.warn("[Email Skip] Admin credentials not found in environment.");
    }

    // 7. Final Response
    console.log("--- [END] Execution Complete ---");
    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry processed.',
      requestId,
      syncStatus: {
        database: dbError ? 'failed' : 'ok',
        email: emailStatus
      }
    });

  } catch (err) {
    console.error("[Fatal Error] Global Catch:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: 'Uplink failure.',
      details: err.message
    }, { status: 500 });
  }
}

/**
 * Handle GET requests (Method Not Allowed)
 */
export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method Not Allowed. This endpoint only accepts project transmissions via POST.' 
  }, { status: 405 });
}