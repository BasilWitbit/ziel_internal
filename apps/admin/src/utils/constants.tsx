const env = import.meta.env

// Environment / runtime constants only. Keep this file free of component imports
// to avoid circular dependencies with pages and services.
export const SUPABASE_PROJECT_URL = env.VITE_SUPABASE_PROJECT_URL as string
export const SUPABASE_DB_PASS = env.VITE_SUPABASE_DB_PASSWORD as string
export const SUPABASE_ACCESS_TOKEN = env.VITE_SUPABASE_ACCESS_TOKEN as string
export const SUPABASE_API_KEY = env.VITE_SUPABASE_API_KEY as string
export const SUPABASE_SERVICE_ROLE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;
export const SUPABASE_EDGE_BASE_URL = env.VITE_SUPABASE_EDGE_BASE_URL as string;

export const NEW_USER_PASS = env.VITE_NEW_USER_PASS as string;