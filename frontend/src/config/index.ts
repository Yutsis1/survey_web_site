import { z } from "zod";

const EnvSchema = z.object({
  // Next.js Server-side only - not exposed to client
  API_URL: z.url().default("http://127.0.0.1:8000"),
  NEXT_PUBLIC_FEATURE_ALPHA: z
    .string()
    .optional()
    .transform(v => v === "true"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error);
  throw new Error("Environment validation failed");
}

export const config = {
  // Use relative path for client-side requests (will use proxy)
  apiUrl: typeof window === 'undefined' ? parsed.data.API_URL : '/api/proxy',
  featureAlpha: Boolean(parsed.data.NEXT_PUBLIC_FEATURE_ALPHA),
} as const;
