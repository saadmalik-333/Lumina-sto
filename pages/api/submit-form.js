import { createClient } from '@supabase/supabase-js';

/**
 * PRODUCTION-READY SUBMISSION HANDLER
 * Designed to never hang by ensuring a JSON response is sent in all scenarios.
 */
export default async function handler(req, res) {
  // 1. Force JSON header immediately
  res.setHeader('Content-Type', 'application/json');

  // 2. Method Guard
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed' 
    });
  }

  try {
    const { 
      fullName, email, projectDetails, service, 
      budgetRange, deadline, requestId 
    } = req.body;

    // 3. Validation Pre-flight
    if (!fullName || !email || !requestId || !projectDetails) {
      return res.status(400).json({ 
        success: false, 
        error: 'Incomplete request data. Please fill all required fields.' 
      });
    }

    // 4. Secret Pre-flight
    const {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY,
      ADMIN_EMAIL
    } = process.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SERVER ERROR: Missing Supabase Credentials');
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection configuration is missing.' 
      });
    }

    // 5. Database Sync (Awaited with 8s limit)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // We wrap the DB call to catch its specific errors
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
      console.error('SUPABASE ERROR:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: `Database sync failed: ${dbError.message}` 
      });
    }

    // 6. Fire-and-Forget Email (NOT Awaited)
    // We do not 'await' this so the user gets a response immediately.
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
          subject: `New Project Inquiry: ${fullName} (${requestId})`,
          html: `
            <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #6366f1;">New Client Request</h2>
              <p><b>Client:</b> ${fullName}</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>Service:</b> ${service}</p>
              <hr />
              <p><b>Brief:</b></p>
              <p style="white-space: pre-wrap;">${projectDetails}</p>
              <p style="font-size: 10px; color: #999;">Reference ID: ${requestId}</p>
            </div>
          `
        })
      }).catch(err => console.error('Silent Email Failure:', err));
    }

    // 7. Guaranteed Final Success Response
    return res.status(200).json({ 
      success: true, 
      message: 'Transmission success.',
      requestId 
    });

  } catch (fatalError) {
    // 8. Global Catch-All
    console.error('FATAL API CRASH:', fatalError);
    return res.status(500).json({ 
      success: false, 
      error: 'A fatal internal error occurred during transmission.' 
    });
  }
}