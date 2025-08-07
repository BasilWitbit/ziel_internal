import { SUPABASE_API_KEY, SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/utils/constants"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = SUPABASE_PROJECT_URL
const supabaseKey = SUPABASE_API_KEY
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // required for OAuth code exchange
    }
})

export const supabaseAdmin = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY)