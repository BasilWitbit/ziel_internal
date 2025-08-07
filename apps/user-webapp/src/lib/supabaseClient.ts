import { config } from "@/utils/config"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = config.supabaseProjectUrl
const supabaseKey = config.supabaseApiKey
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // required for OAuth code exchange
    }
})

