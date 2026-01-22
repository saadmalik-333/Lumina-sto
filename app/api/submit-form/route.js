import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form/route.js
 * Handles form submissions via NodeMailer (SMTP) and Supabase.
 */

export async function POST(req) {
  console.log("--- [START] Form Submission Received ---");
  
  try {
    // 1. Parse Request Body
    const body = await req.json();
    console.log("Form received:", body);

    // 2. Destructure with Fallbacks & Sanitization
    const {
      fullName = 'Unknown Client',
      email = 'not-provided@example.com',
      projectDetails = 'No project details provided',
      service = 'General Inquiry',
      budgetRange = 'Not Specified',
      deadline = 'Not Specified',
      requestId = `LMN-${Math.floor(1000 + Math.random() * 9000)}`
    } = body;

    // 3. Mandatory Field Validation
    if (!body.fullName || !body.email || !body.projectDetails) {
      console.warn("Validation failed: Core fields missing.");
      return NextResponse.json({ 
        success: false, 
        error: 'Required fields missing: fullName, email, and projectDetails are mandatory.' 
      }, { status: 400 });
    }

    // 4. Configuration Check (Server-Side Debugging)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;
    const emailPassword = process.env.EMAIL_APP_PASSWORD;

    console.log("Supabase URL & key present?", !!supabaseUrl, !!supabaseKey);
    console.log("Admin Email & App Password present?", !!adminEmail, !!emailPassword);

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration.");
      return NextResponse.json({ success: false, error: 'Database service misconfigured.' }, { status: 500 });
    }

    // 5. Database Insertion (Supabase)
    const supabase = createClient(supabaseUrl, supabaseKey);
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
      console.error("Supabase insert error:", dbError.message);
      // Continue to email notification even if DB fails for visibility
    } else {
      console.log("Supabase record created successfully.");
    }

    // 6. Email Notification via NodeMailer (SMTP)
    let emailStatus = "skipped";
    if (adminEmail && emailPassword) {
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
        subject: `NEW STUDIO INQUIRY: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5; margin-top: 0;">Lumina Project Brief</h2>
            <p><strong>Client:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Budget:</strong> ${budgetRange}</p>
            <p><strong>Deadline:</strong> ${deadline}</p>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5;">
              <p style="margin: 0; font-weight: bold; color: #4f46e5;">Project Vision:</p>
              <p style="margin-top: 10px; font-style: italic;">${projectDetails}</p>
            </div>
          </div>
        `,
      };

      console.log("Email payload prepared:", {
        to: adminEmail,
        subject: mailOptions.subject
      });

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("NodeMailer success:", info.messageId);
        emailStatus = "success";
      } catch (mailErr) {
        console.error("NodeMailer failure:", mailErr.message);
        emailStatus = "failed";
      }
    } else {
      console.warn("Email skipped: Missing admin credentials in environment variables.");
    }

    // 7. Success Response
    console.log("--- [END] Process Complete ---");
    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry successfully transmitted.', 
      requestId,
      debug: {
        db: dbError ? 'failed' : 'ok',
        email: emailStatus
      }
    });

  } catch (err) {
    console.error("Fatal API Error:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal processing failure.',
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
    error: 'Method Not Allowed. Use POST to submit project inquiries.' 
  }, { status: 405 });
}