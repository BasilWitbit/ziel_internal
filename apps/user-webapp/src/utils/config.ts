export const config = {
    supabaseProjectUrl: import.meta.env.VITE_SUPABASE_PROJECT_URL as string,
    supabaseDbPass: import.meta.env.VITE_SUPABASE_DB_PASSWORD as string,
    supabaseAccessToken: import.meta.env.VITE_SUPABASE_ACCESS_TOKEN as string,
    supabaseApiKey: import.meta.env.VITE_SUPABASE_API_KEY as string,
    supabaseServiceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string,
    supabaseEdgeBaseUrl: import.meta.env.VITE_SUPABASE_EDGE_BASE_URL as string,
    newUserPass: import.meta.env.VITE_NEW_USER_PASS as string,
};
