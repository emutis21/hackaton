const {
  DATABASE_URL = "",
  NEXT_PUBLIC_SUPABASE_URL = "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY = "",
  SUPABASE_SERVICE_ROLE_KEY = "",
  DEEPSEEK_API_KEY = "",
  NODE_ENV = "development",
  USE_MOCK_DATA = "",
} = process.env;

export const config = {
  isDev: NODE_ENV === "development",
  useMockData: USE_MOCK_DATA === "true" || !DATABASE_URL,
  db: {
    url: DATABASE_URL,
  },
  supabase: {
    url: NEXT_PUBLIC_SUPABASE_URL,
    anonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
  },
  ai: {
    deepseekApiKey: DEEPSEEK_API_KEY,
  },
};
