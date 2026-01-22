
import { createClient } from '@supabase/supabase-js';

/**
 * PRODUCTION-GRADE SUBMISSION HANDLER
 * Designed for high reliability and zero-hang performance.
 */
export default async function handler(req, res) {
  // 1. Force JSON response headers
  res.setHeader('Content-Type', 'application/json');

  // 2. Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed. Use POST.' 
    });
  }

  try {
    const { 
      fullName, email, projectDetails, service, 
      budgetRange, deadline, requestId 
    } = req.body;

    // 3. Strict Validation
    if (!fullName || !email || !requestId || !projectDetails) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required project data.' 
      });
    }

    // 4. Resource Check
    const {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY,
      ADMIN_EMAIL
    } = process.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SYSTEM ERROR: Supabase env vars missing');
      return res.status(500).json({ 
        success: false, 
        error: 'Database configuration error on server.' 
      });
    }

    // 5. Database Operation (Awaited)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: dbError } = await supabase
      .from('requests')
      .insert([{
        request_id: requestId,
        full_name: fullName,
        email: email.toLowerCase().trim(),
        service: service,
        project_details: projectDetails,
        budget_range: budgetRange,
        deadline: deadline,
        status: 'Pending',
        created_at: new Date().toISOString()
      }]);

    if (dbError) {
      console.error('DATABASE ERROR:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: `Database Sync Failed: ${dbError.message}` 
      });
    }

    // 6. Background Task: Resend Email Notification (Fire-and-Forget)
    // We explicitly do NOT 'await' this to prevent the client from hanging.
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Lumina Studio <onboarding@resend.dev>',
          to: [ADMIN_EMAIL],
          subject: `New Inquiry: ${fullName} [${requestId}]`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #6366f1; margin-top: 0;">New Project Received</h2>
              <p><b>Client:</b> ${fullName}</p>
              <p><b>Service:</b> ${service}</p>
              <p><b>Brief:</b></p>
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">${projectDetails}</div>
              <p style="font-size: 10px; color: #9ca3af; margin-top: 20px;">Ref ID: ${requestId}</p>
            </div>
          `
        })
      }).catch(err => console.error('Email Notification Failed Silently:', err));
    }

    // 7. Immediate Success JSON
    return res.status(200).json({ 
      success: true, 
      message: 'Transmission Successful',
      requestId 
    });

  } catch (fatalError) {
    console.error('CRITICAL API ERROR:', fatalError);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected internal server error occurred.' 
    });
  }
}
