import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * DEBUGGING BACKEND API: /app/api/submit-form
 * Optimized for tracing issues in Vercel/Supabase/Resend.
 */

export async function POST(req) {
  try {
    // 1. Log incoming request
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
      console.warn("Validation failed: Missing core fields (fullName, email, or projectDetails)");
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: fullName, email, projectDetails.' 
      }, { status: 400 });
    }

    // 4. Configuration Check
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    console.log("Supabase URL & key presence:", !!supabaseUrl, !!supabaseKey);
    console.log("Resend Key & Admin Email presence:", !!resendKey, !!adminEmail);

    if (!supabaseUrl || !supabaseKey) {
      console.error("CRITICAL: Supabase environment variables are missing.");
      return NextResponse.json({ success: false, error: 'Database configuration missing.' }, { status: 500 });
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
      // We continue to email attempt even if DB fails to ensure admin visibility of the failure
    } else {
      console.log("Supabase insert successful.");
    }

    // 6. Email Notification via Resend (Synchronous for logs)
    if (resendKey && adminEmail) {
      const emailPayload = {
        from: 'onboarding@resend.dev',
        to: adminEmail,
        subject: `New Request: ${fullName} (${requestId})`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2 style="color: #4f46e5;">New Creative Inquiry Received</h2>
            <p><strong>Client:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>ID:</strong> ${requestId}</p>
            <hr />
            <p><strong>Project Vision:</strong></p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
              ${projectDetails}
            </div>
            <p style="margin-top: 20px; font-weight: bold; color: #4f46e5;">
              A new client has filled the form. Please review and approve from the admin panel.
            </p>
          </div>
        `
      };

      console.log("Sending email payload:", emailPayload);

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
          },
          body: JSON.stringify(emailPayload)
        });

        console.log("Resend API response ok?", emailResponse.ok);
        if (!emailResponse.ok) {
          const errData = await emailResponse.json();
          console.error("Resend API error details:", errData);
        } else {
          const successData = await emailResponse.json();
          console.log("Resend successfully delivered email. ID:", successData.id);
        }
      } catch (emailErr) {
        console.error("Fatal exception in email fetch logic:", emailErr.message);
      }
    } else {
      console.warn("Skipping email: Resend API Key or Admin Email not found in process.env");
    }

    // 7. Success Response
    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry transmitted to studio cloud.', 
      requestId,
      dbSynced: !dbError
    });

  } catch (err) {
    console.error("Global API Exception:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal processing error.',
      debug: err.message
    }, { status: 500 });
  }
}

/**
 * Handle GET requests (Method Not Allowed)
 */
export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method Not Allowed. This endpoint only accepts project brief POST requests.' 
  }, { status: 405 });
}
