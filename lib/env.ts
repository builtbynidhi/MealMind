// Centralized, validated access to environment variables.
// Server-only secrets are read lazily so they never leak into the client bundle.

function required(name: string): string {
 const value = process.env[name];
 if (!value) {
 throw new Error(
`Missing required environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
 );
 }
 return value;
}

export const env = {
 // Public (inlined at build time, safe in the browser)
 supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
 supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),

 // Server-only secrets
 supabaseServiceRole: () => required("SUPABASE_SERVICE_ROLE_KEY"),
 geminiKey: () => required("GOOGLE_GENERATIVE_AI_API_KEY"),
 groqKey: () => process.env.GROQ_API_KEY ??"", // optional failover
 cronSecret: () => required("CRON_SECRET"),

 // Optional Cloudflare Workers AI (edge embeddings + Whisper fallback)
 cfAccountId: () => process.env.CF_ACCOUNT_ID ??"",
 cfWorkersAiToken: () => process.env.CF_WORKERS_AI_TOKEN ??"",
} as const;
