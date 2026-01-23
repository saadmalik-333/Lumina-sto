import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * PRODUCTION API HANDLER: /api/submit-form.js
 * Optimized for Vercel Node.js serverless runtime with fallbacks for environment variables.
 */
export default async function handler(req, res) {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  // 2. Strict Method Check
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'REST Method Not Allowed' });
  }

  const tId = `TX-${Math.random().toString(36).substring(7).toUpperCase()}`;
  const now = new Date().toISOString();
  console.log(`[${now}] [${tId}] --- INBOUND PROJECT BRIEF ---`);

  try {
    // 3. Payload Extraction
    const { fullName, email, projectDetails, service, budgetRange, deadline, requestId } = req.body;

    // 4. Validation
    if (!fullName || !email || !projectDetails || !requestId) {
      console.error(`[${tId}] Validation Error: Fields missing.`);
      return res.status(400).json({ success: false, error: "Required project details are missing." });
    }

    // 5. Supabase Sync (Using Fallbacks for missing environment variables)
    const supabaseUrl = process.env.SUPABASE_URL || 
                        process.env.VITE_SUPABASE_URL || 
                        'https://peosewioliuyozdjziep.supabase.co';

    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                        process.env.VITE_SUPABASE_ANON_KEY || 
                        'sb_publishable_jn7yaeIrf5iNeFSS8fAiMg_RFWzQJOL';

    console.log(`[${tId}] DB Sync: Connecting to ${supabaseUrl}...`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from('requests').insert([
      {
        request_id: requestId,
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        service: service || 'general',
        project_details: projectDetails.trim(),
        budget_range: budgetRange,
        deadline: deadline,
        status: 'Pending',
        created_at: now
      }
    ]);

    if (dbError) {
      console.error(`[${tId}] DB Error: ${dbError.message}`);
      throw new Error(`Database synchronization failed: ${dbError.message}`);
    }
    console.log(`[${tId}] DB Sync: Success.`);

    // 6. Admin Notification (Nodemailer Gmail SMTP)
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
    const adminEmail = process.env.ADMIN_EMAIL;

    if (gmailUser && gmailPass && adminEmail) {
      console.log(`[${tId}] Email Dispatch: Preparing...`);
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailPass },
      });

      const mailOptions = {
        from: `"Lumina Studio" <${gmailUser}>`,
        to: adminEmail,
        subject: `[NEW] Project Brief: ${fullName} - ${requestId}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 30px; border: 1px solid #f1f5f9; border-radius: 20px;">
            <h2 style="color: #4f46e5;">New Project Inquiry</h2>
            <p><strong>Request ID:</strong> ${requestId}</p>
            <p><strong>Client:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p><strong>Brief:</strong></p>
            <p style="white-space: pre-wrap; line-height: 1.6;">${projectDetails}</p>
          </div>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[${tId}] Email Dispatch: Success (ID: ${info.messageId})`);
      } catch (emailErr) {
        console.warn(`[${tId}] Email Warning: Dispatch failed. ${emailErr.message}`);
      }
    } else {
      console.warn(`[${tId}] Email Skip: Configuration missing (GMAIL_USER, GMAIL_APP_PASSWORD, or ADMIN_EMAIL).`);
    }

    // 7. Success Response
    console.log(`[${tId}] --- SUBMISSION COMPLETE ---`);
    return res.status(200).json({ 
      success: true, 
      message: "Form submitted successfully",
      requestId 
    });

  } catch (err) {
    console.error(`[${tId}] CRITICAL ERROR:`, err.message);
    return res.status(500).json({ 
      success: false, 
      error: err.message || "Uplink synchronization failure." 
    });
  }
}