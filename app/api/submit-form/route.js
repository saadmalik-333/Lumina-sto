import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

/**
 * APP ROUTER HANDLER: /app/api/submit-form/route.js
 */
export async function POST(req) {
  const tId = `TX-APP-${Math.random().toString(36).substring(7).toUpperCase()}`;
  try {
    const body = await req.json();
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error: dbError } = await supabase.from('requests').insert([
      {
        request_id: requestId,
        full_name: fullName,
        email: email.toLowerCase(),
        service,
        project_details: projectDetails,
        budget_range: budgetRange,
        deadline,
        status: 'Pending'
      }
    ]);

    if (dbError) throw dbError;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      const transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass } });
      await transporter.sendMail({
        from: `"Lumina" <${gmailUser}>`,
        to: adminEmail,
        subject: `[NEW] ${fullName} - ${requestId}`,
        html: `<p><strong>Client:</strong> ${fullName}</p><p><strong>Brief:</strong> ${projectDetails}</p>`
      }).catch(e => console.error(e));
    }

    return NextResponse.json({ success: true, message: "Form submitted successfully", requestId });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 24, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
}
