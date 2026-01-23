import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * FALLBACK API HANDLER: /api/submit-form.js
 * Mirrors the robust logic of the App Router version for maximum compatibility.
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const tId = `FALLBACK-${Math.random().toString(36).substring(7).toUpperCase()}`;
  console.log(`[${tId}] --- FALLBACK API TRIGGERED ---`);

  try {
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = req.body;

    if (!fullName || !email || !projectDetails || !requestId) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    // DB Insertion
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error: dbError } = await supabase.from('requests').insert([
      { request_id: requestId, full_name: fullName, email: email.toLowerCase(), service, project_details: projectDetails, budget_range: budgetRange, deadline, status: 'Pending' }
    ]);

    if (dbError) throw dbError;

    // Email Dispatch
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      const transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass } });
      await transporter.sendMail({
        from: `"Lumina Studio" <${gmailUser}>`,
        to: adminEmail,
        subject: `[NEW] ${fullName} - ${requestId}`,
        text: `New Lead: ${fullName}\nEmail: ${email}\nDetails: ${projectDetails}`
      }).catch(e => console.error("Email Error:", e.message));
    }

    return res.status(200).json({ success: true, message: "Form submitted successfully", requestId });
  } catch (err) {
    console.error(`[${tId}] Error:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
