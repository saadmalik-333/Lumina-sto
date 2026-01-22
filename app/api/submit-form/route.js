import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key for server-side elevated privileges
// This bypasses RLS and allows secure server-to-server communication
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/submit-form
 * Handles high-end project inquiries with cloud sync and admin notifications.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      fullName, 
      email, 
      projectDetails, 
      service, 
      budgetRange, 
      deadline, 
      requestId 
    } = body;

    // 1. Strict Backend Validation
    if (!fullName || !email || !projectDetails) {
      return NextResponse.json(
        { ok: false, message: "Incomplete brief. Required fields: name, email, details." }, 
        { status: 400 }
      );
    }

    // 2. Supabase Production Sync
    const { error: dbError } = await supabase
      .from('requests')
      .insert([{
        request_id: requestId || `LMN-${Math.floor(1000 + Math.random() * 9000)}`,
        full_name: fullName,
        email: email.toLowerCase().trim(),
        service: service || 'general',
        project_details: projectDetails,
        budget_range: budgetRange || 'TBD',
        deadline: deadline || 'Flexible',
        status: 'Pending',
        created_at: new Date().toISOString()
      }]);

    if (dbError) {
      console.error("Cloud DB Sync Error:", dbError);
      throw new Error("Failed to synchronize with studio cloud.");
    }

    /**
     * 3. FIRE-AND-FORGET EMAIL NOTIFICATION
     * We call the email function but DO NOT 'await' it. 
     * This prevents Resend API latency from causing a frontend hang.
     */
    triggerEmailNotification(body).catch(err => {
      console.error("Background Notification Error:", err);
    });

    // 4. Instant Response to UI
    return NextResponse.json({ 
      ok: true, 
      message: "Uplink established. Project logged." 
    });

  } catch (err) {
    console.error("Production API Exception:", err);
    return NextResponse.json({ 
      ok: false, 
      message: "The studio uplink is experiencing interference.",
      error: err.message 
    }, { status: 500 });
  }
}

/**
 * Background worker for email notifications via Resend
 */
async function triggerEmailNotification(data) {
  const { RESEND_API_KEY, ADMIN_EMAIL } = process.env;

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.warn("Email skipped: Environment variables not configured.");
    return;
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Lumina Studio <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `[NEW INQUIRY] ${data.fullName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">New Creative Brief</h2>
          <p><strong>Client:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Service:</strong> ${data.service}</p>
          <p><strong>Budget:</strong> ${data.budgetRange}</p>
          <p><strong>Deadline:</strong> ${data.deadline}</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Project Description:</strong><br />
            ${data.projectDetails}
          </div>
          <p style="color: #6366f1; font-weight: bold;">A new client has filled the form. Please review and approve from the admin panel.</p>
        </div>
      `
    })
  });

  if (!resendResponse.ok) {
    const errorBody = await resendResponse.json();
    throw new Error(`Resend Error: ${JSON.stringify(errorBody)}`);
  }
}

// Block GET access for this endpoint
export async function GET() {
  return NextResponse.json({ ok: false, message: "POST only." }, { status: 405 });
}
