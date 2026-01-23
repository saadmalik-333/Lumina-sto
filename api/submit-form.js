import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * VERCEL SERVERLESS FUNCTION: /api/submit-form.js
 * (Fallback handler for standard API routing)
 */

export default async function handler(req, res) {
  const logPrefix = `[SERVERLESS ${new Date().toISOString()}]`;
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  console.log(`${logPrefix} --- START Serverless Submission ---`);

  try {
    const body = req.body;
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = body;

    // 1. Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    // 2. Supabase Sync
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error: dbError } = await supabase.from('requests').insert([{
      request_id: requestId,
      full_name: fullName.trim(),
      email: email.toLowerCase().trim(),
      service,
      project_details: projectDetails,
      budget_range: budgetRange,
      deadline,
      status: 'Pending',
      created_at: new Date().toISOString()
    }]);

    if (dbError) throw new Error(`DB Sync: ${dbError.message}`);
    console.log(`${logPrefix} DB Sync Success`);

    // 3. Email Notify
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      await transporter.sendMail({
        from: `"Lumina Platform" <${gmailUser}>`,
        to: adminEmail,
        subject: `NEW PROJECT: ${fullName} (${requestId})`,
        html: `<p>New inquiry from <strong>${fullName}</strong> for <strong>${service}</strong>.</p><p>${projectDetails}</p>`
      });
      console.log(`${logPrefix} Email Dispatched`);
    }

    console.log(`${logPrefix} --- END Serverless Success ---`);
    return res.status(200).json({ success: true, requestId });

  } catch (err) {
    console.error(`${logPrefix} CRITICAL FAILURE:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
