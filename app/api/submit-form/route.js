import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * DEBUGGING BACKEND API: /api/submit-form
 * Handles project inquiries with Supabase sync and verbose Resend debugging.
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

    // 1. Backend Validation
    if (!fullName || !email || !projectDetails) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: fullName, email, projectDetails.' 
      }, { status: 400 });
    }

    // 2. Setup Supabase client
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

    // 4. Trigger Admin Notification (Awaited for Debugging)
    // Using the specific debugging snippet provided to catch termination issues
    try {
      console.log("Sending email payload:", {
        from: 'onboarding@resend.dev',
        to: process.env.ADMIN_EMAIL,
        subject: `New Request: ${fullName}`,
        html: `<p>${projectDetails}</p>`
      });

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: process.env.ADMIN_EMAIL,
          subject: `New Request: ${fullName}`,
          html: `<p>${projectDetails}</p>`
        })
      });

      console.log("Resend API response ok?", emailResponse.ok);
      if (!emailResponse.ok) {
        const errData = await emailResponse.json();
        console.error("Resend API error:", errData);
      } else {
        const successData = await emailResponse.json();
        console.log("Resend Success ID:", successData.id);
      }
    } catch (emailErr) {
      console.error("Fatal Fetch failure in email logic:", emailErr.message);
      // We do NOT return an error here so the frontend still gets a 'success' 
      // response for the DB insertion.
    }

    // 5. Final JSON Success Response
    return NextResponse.json({ 
      success: true, 
      message: 'Inquiry processed. Database synchronized.', 
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