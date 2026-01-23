import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * PAGES ROUTER FALLBACK: /pages/api/submit-form.js
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

  try {
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = req.body;

    const supabaseUrl = process.env.SUPABASE_URL || 'https://peosewioliuyozdjziep.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.VITE_SUPABASE_ANON_KEY || 
                        'sb_publishable_jn7yaeIrf5iNeFSS8fAiMg_RFWzQJOL';

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: dbError } = await supabase.from('requests').insert([
      { request_id: requestId, full_name: fullName, email: email.toLowerCase(), service, project_details: projectDetails, budget_range: budgetRange, deadline, status: 'Pending' }
    ]);

    if (dbError) throw dbError;

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
    return res.status(500).json({ success: false, error: err.message });
  }
}