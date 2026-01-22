import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/submit-form
 * Production-grade endpoint for project inquiries.
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

    // 1. Validation
    if (!fullName || !email || !projectDetails) {
      return NextResponse.json(
        { ok: false, message: "Required fields missing: Name, Email, or Details." }, 
        { status: 400 }
      );
    }

    const finalRequestId = requestId || `LMN-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Supabase Insert (Primary Task)
    const { error: dbError } = await supabase
      .from('requests')
      .insert([{
        request_id: finalRequestId,
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
      console.error("Supabase Error:", dbError.message);
      throw new Error("Database synchronization failed.");
    }

    /**
     * 3. EMAIL NOTIFICATION (Secondary Task)
     * We do NOT 'await' this so the user gets an instant response.
     * We add a .catch to ensure background errors don't crash the main thread.
     */
    sendAdminNotification({ ...body, requestId: finalRequestId }).catch(err => {
      console.error("Background Email Error:", err.message);
    });

    // 4. Instant Response to prevent "Transmitting..." hang
    return NextResponse.json({ 
      ok: true, 
      message: "Project brief successfully synchronized with Lumina Studio cloud.",
      requestId: finalRequestId
    });

  } catch (err) {
    console.error("API Route Exception:", err.message);
    return NextResponse.json({ 
      ok: false, 
      message: "The studio uplink is experiencing interference.",
      error: err.message 
    }, { status: 500 });
  }
}

/**
 * Reliable Email Delivery via Resend API
 */
async function sendAdminNotification(data) {
  const { RESEND_API_KEY, ADMIN_EMAIL } = process.env;

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.error("Email aborted: Missing RESEND_API_KEY or ADMIN_EMAIL in environment.");
    return;
  }

  // Formatting variables for cleaner email
  const clientName = data.fullName || 'Unknown Client';
  const clientEmail = data.email || 'No Email';
  const projectInfo = data.projectDetails || 'No details provided';
  const serviceType = data.service || 'General Inquiry';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Lumina Studio <onboarding@resend.dev>', // Must be exactly this for Resend free tier
        to: [ADMIN_EMAIL],
        subject: `NEW PROJECT: ${clientName} (${data.requestId})`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4f46e5; padding: 20px; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px;">New Creative Inquiry</h2>
            </div>
            <div style="padding: 30px;">
              <p><strong>Client Name:</strong> ${clientName}</p>
              <p><strong>Client Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
              <p><strong>Service Requested:</strong> ${serviceType}</p>
              <p><strong>Workspace ID:</strong> ${data.requestId}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Project Details:</strong></p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5;">
                ${projectInfo}
              </div>
              <p style="margin-top: 30px; font-weight: bold; color: #4f46e5;">
                A new client has filled the form. Please review and approve from the admin panel.
              </p>
            </div>
          </div>
        `
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Resend API rejected request:", JSON.stringify(result));
    } else {
      console.log("Admin notification triggered successfully:", result.id);
    }
  } catch (error) {
    console.error("Fetch failure in email worker:", error.message);
  }
}

// Block direct GET access
export async function GET() {
  return NextResponse.json({ ok: false, message: "Method Not Allowed" }, { status: 405 });
}
