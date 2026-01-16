
# Lumina Creative Studio Platform

## 🛠️ Supabase Database Setup (Reset & Recreate)

If you get an error saying "relation requests already exists", it means you have an old version of the table. **Warning: Running this will delete existing test data.**

Copy and paste this entire block into your **Supabase SQL Editor** and click **Run**:

```sql
-- 1. Remove the old table if it exists
DROP TABLE IF EXISTS public.requests CASCADE;

-- 2. Create the new optimized Requests Table
CREATE TABLE public.requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT NOT NULL,
    project_details TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    deadline TEXT NOT NULL,
    
    -- Status with strict validation
    status TEXT NOT NULL DEFAULT 'Pending' 
    CHECK (status IN ('Pending', 'Accepted', 'In Progress', 'Completed', 'Rejected')),
    
    -- Client Portal Fields
    start_date TEXT,
    schedule TEXT,
    meeting_link TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Performance Optimization (Indices)
CREATE INDEX idx_requests_lookup ON public.requests (request_id, email);
CREATE INDEX idx_requests_status ON public.requests (status);

-- 4. Enable Security
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- POLICY: Allow public form submissions
CREATE POLICY "Allow public inserts" 
ON public.requests FOR INSERT 
TO public 
WITH CHECK (true);

-- POLICY: Allow public portal lookups (Crucial for Client Login)
CREATE POLICY "Allow portal selects" 
ON public.requests FOR SELECT 
TO public 
USING (true);

-- POLICY: Full Admin Control
CREATE POLICY "Allow admin all" 
ON public.requests FOR ALL 
TO authenticated 
USING (true);
```

## 🚨 Troubleshooting "Email Not Found"

If the portal says "Not Found" even though data exists:
1.  **Check RLS:** Ensure you ran the `Allow portal selects` policy above.
2.  **Email Case:** The app uses case-insensitive matching, but ensure there are no trailing spaces in your Supabase data.
3.  **Project ID:** Ensure you are using the full ID (e.g., `LMN-1234`) and not just the numbers.

## 🔑 Admin User Setup

1.  Go to **Supabase > Authentication > Users**.
2.  Click **Add User** -> **Create new user**.
3.  Enter your email and password.
4.  **Crucial:** Go to **Authentication > Providers > Email** and turn **OFF** "Confirm Email" so you can log in immediately.
