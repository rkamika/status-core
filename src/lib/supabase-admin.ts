import { createClient } from '@supabase/supabase-js'

// This client uses the SERVICE_ROLE_KEY and should ONLY be used on the server (API routes)
// It bypasses Row Level Security (RLS)
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
