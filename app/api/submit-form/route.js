import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * PRODUCTION BACKEND API: /app/api/submit-form
 * Optimized for debugging and reliability.
 * Runtime: Node.js (Vercel Serverless)
 */

export async function POST(req) {
  console.log("--- [START] Form Submission Triggered ---");
  
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
      console.warn("[Validation] Missing required fields.");
      return NextResponse.json({ 
        success: false, 
        error: 'Required fields missing: Name, Email, and Project Details are mandatory.' 
      }, { status: 400 });
    }

    // 4. Environment Configuration Check (Server-Side Logs)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    console.log("Configuration Check:", {
      supabaseConfigured: !!(supabaseUrl && supabaseKey),
      resendConfigured: !!resendKey,
      adminEmailSet: !!adminEmail
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error("[Config] Supabase environment variables are missing.");
      return NextResponse.json({ success: false, error: 'Database configuration error.' }, { status: 500 });
    }

    // 5. Database Insertion (Supabase)
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`[Database] Attempting insert for request: ${requestId}`);

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
      // We still try to send the email even if DB fails for visibility
    } else {
      console.log("[Database] Record created successfully.");
    }

    // 6. Email Notification via Resend (Awaited for debugging)
    let emailStatus = "not_sent";
    if (resendKey && adminEmail) {
      const emailPayload = {
        from: 'Lumina Studio <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `NEW INQUIRY: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b; max-width: 600px;">
            <h2 style="color: #6366f1; margin-top: 0;">New Project Received</h2>
            <p><strong>Client:</strong> ${fullName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Service Type:</strong> ${service}</p>
            <p><strong>Budget Range:</strong> ${budgetRange}</p>
            <p><strong>Target Deadline:</strong> ${deadline}</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #6366f1;">
               <p style="margin-top: 0; font-weight: bold; color: #6366f1;">The Vision:</p>
               <p style="margin-bottom: 0;">${projectDetails}</p>
            </div>
            <p style="font-weight: bold; color: #4f46e5;">
               A new client has filled the form. Please review and approve from the admin panel.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #94a3b8;">System Reference ID: ${requestId}</p>
          </div>
        `
      };

      console.log("[Email] Dispatching payload to Resend:", {
        to: adminEmail,
        subject: emailPayload.subject
      });

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
          },
          body: JSON.stringify(emailPayload)
        });

        const result = await response.json();
        console.log("Resend API response status:", response.status);
        console.log("Resend API response body:", result);

        if (response.ok) {
          emailStatus = "success";
        } else {
          emailStatus = `failed_${response.status}`;
          console.error("[Resend Error]", result);
        }
      } catch (err) {
        emailStatus = "error";
        console.error("[Email Exception]", err.message);
      }
    } else {
      console.warn("[Email Skip] Skipping email trigger due to missing credentials.");
    }

    // 7. Unified JSON Response
    console.log("--- [END] Process Completed ---");
    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry successfully processed by the studio.',
      requestId,
      debug: {
        db: dbError ? 'failed' : 'ok',
        email: emailStatus
      }
    });

  } catch (err) {
    console.error("[Fatal Error] Global Exception:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: 'Uplink failure. Please try again or contact support directly.',
      message: err.message
    }, { status: 500 });
  }
}

// Block GET requests
export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method Not Allowed. This endpoint only accepts project transmissions via POST.' 
  }, { status: 405 });
}
