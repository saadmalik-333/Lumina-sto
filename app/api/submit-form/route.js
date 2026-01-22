import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * PRODUCTION BACKEND API: /api/submit-form
 * Handles project inquiries with Supabase sync and Resend email notifications.
 */

// Fire-and-forget email sender to avoid frontend blocking
async function sendAdminNotification({ fullName, email, projectDetails, service, requestId }) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'saad.real777@gmail.com';

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not set in environment.');
      return;
    }

    const payload = {
      from: 'Lumina Studio <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `New Request: ${fullName || 'Unknown Client'} (${requestId || 'N/A'})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
          <h2 style="color: #6366f1; margin-bottom: 20px;">Project Inquiry Received</h2>
          <p><strong>Client:</strong> ${fullName || 'Unknown Client'}</p>
          <p><strong>Email:</strong> ${email || 'Not Provided'}</p>
          <p><strong>Service:</strong> ${service || 'Not Provided'}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p><strong>Project Vision:</strong></p>
             <p>${projectDetails || 'No details provided'}</p>
          </div>
          <p style="font-weight: bold; color: #6366f1;">
             A new client has filled the form. Please review and approve from the admin panel.
          </p>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">Ref ID: ${requestId || 'N/A'}</p>
        </div>
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API Error:', errorData);
    } else {
      console.log('Admin email triggered successfully');
    }
  } catch (err) {
    console.error('Error sending admin email:', err);
  }
}

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

    // 1. Backend Validation
    if (!fullName || !email || !projectDetails) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: fullName, email, projectDetails.' 
      }, { status: 400 });
    }

    // 2. Setup Supabase client with Service Role Key for elevated permissions
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables missing');
      return NextResponse.json({ 
        success: false, 
        error: 'Server misconfigured: Supabase credentials missing.' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Insert project brief into Supabase
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
      console.error('Supabase insert error:', dbError.message);
      return NextResponse.json({ 
        success: false, 
        error: 'Database insertion failed.' 
      }, { status: 500 });
    }

    // 4. Trigger Admin Notification (Fire-and-Forget)
    // We don't await this to ensure the frontend receives a response immediately
    sendAdminNotification({ fullName, email, projectDetails, service, requestId });

    // 5. Success Response
    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry submitted successfully.', 
      requestId 
    });

  } catch (err) {
    console.error('Fatal API error:', err.message);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error.' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, message: "Method Not Allowed" }, { status: 405 });
}