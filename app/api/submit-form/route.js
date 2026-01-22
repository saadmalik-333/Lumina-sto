import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * PRODUCTION BACKEND API: /api/submit-form
 * Optimized for performance and reliability.
 */

// Initialize Supabase with Service Role Key (Server-Side Only)
// This bypasses RLS to ensure the record is written even if public inserts are restricted.
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req) {
  // 1. Wrap entire process in a global try-catch to guarantee a JSON response
  try {
    const body = await req.json();
    
    // 2. Destructure and Sanitize Inputs
    const { 
      fullName = 'Unknown Client', 
      email = 'no-reply@example.com', 
      projectDetails = 'No details provided', 
      service = 'General Inquiry', 
      budgetRange = 'Not Specified', 
      deadline = 'Flexible', 
      requestId 
    } = body;

    // 3. Backend Validation (Critical Security)
    if (!body.fullName || !body.email || !body.projectDetails) {
      return NextResponse.json(
        { ok: false, message: "Validation Failed: Name, Email, and Project Details are required." }, 
        { status: 400 }
      );
    }

    // Ensure a unique Request ID exists
    const finalRequestId = requestId || `LMN-${Math.floor(1000 + Math.random() * 9000)}`;

    console.log(`[API] Processing submission for ${finalRequestId} (${email})`);

    // 4. Primary Task: Supabase Cloud Sync
    // We await this to ensure data integrity before confirming success to the user
    const { error: dbError } = await supabase
      .from('requests')
      .insert([{
        request_id: finalRequestId,
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        service,
        project_details: projectDetails.trim(),
        budget_range: budgetRange,
        deadline,
        status: 'Pending',
        created_at: new Date().toISOString()
      }]);

    if (dbError) {
      console.error("[Database Error]", dbError.message);
      throw new Error("Failed to synchronize project with cloud storage.");
    }

    /**
     * 5. Secondary Task: Fire-and-Forget Email Notification
     * We do NOT 'await' this function. This ensures the response is returned to 
     * the client instantly, avoiding the "Transmitting..." hang in the UI.
     */
    triggerEmailNotification({
      fullName,
      email,
      projectDetails,
      service,
      budgetRange,
      deadline,
      requestId: finalRequestId
    }).catch(err => {
      console.error("[Email Background Worker Error]", err.message);
    });

    // 6. Return success response immediately
    return NextResponse.json({ 
      ok: true, 
      message: "Studio uplink successful. Your brief has been queued for review.",
      requestId: finalRequestId
    });

  } catch (err) {
    console.error("[Global API Exception]", err.message);
    return NextResponse.json({ 
      ok: false, 
      message: "Internal Server Error: Uplink interference detected.",
      error: err.message 
    }, { status: 500 });
  }
}

/**
 * Background worker for Resend Email API
 * Sends notification to the Studio Admin
 */
async function triggerEmailNotification(data) {
  const { RESEND_API_KEY, ADMIN_EMAIL } = process.env;

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.warn("[Email Skip] Missing RESEND_API_KEY or ADMIN_EMAIL in environment variables.");
    return;
  }

  const emailBody = {
    from: 'Lumina Studio Notifications <onboarding@resend.dev>',
    to: [ADMIN_EMAIL],
    subject: `[New Inquiry] ${data.fullName} - ${data.requestId}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">New Creative Brief Received</h2>
          <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 14px;">ID: ${data.requestId}</p>
        </div>
        <div style="padding: 24px;">
          <p><strong>Client:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>Service:</strong> ${data.service}</p>
          <p><strong>Budget:</strong> ${data.budgetRange}</p>
          <p><strong>Deadline:</strong> ${data.deadline}</p>
          <div style="margin: 20px 0; padding: 16px; background-color: #f9fafb; border-left: 4px solid #6366f1; border-radius: 4px;">
            <p style="margin: 0;"><strong>Details:</strong></p>
            <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${data.projectDetails}</p>
          </div>
          <p style="color: #4f46e5; font-weight: bold; margin-top: 24px; border-top: 1px solid #eee; pt-16px;">
            A new client has filled the form. Please review and approve from the admin panel.
          </p>
        </div>
      </div>
    `
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify(emailBody)
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error("[Resend Failure]", result);
    throw new Error(`Resend API Error: ${result.message || 'Unknown error'}`);
  }

  console.log(`[Email Success] Notification sent for ${data.requestId}. Resend ID: ${result.id}`);
}

// Ensure direct GET requests are handled gracefully
export async function GET() {
  return NextResponse.json({ ok: false, message: "Method Not Allowed. Use POST." }, { status: 405 });
}
