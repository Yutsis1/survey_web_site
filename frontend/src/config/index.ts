import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

// define the schema for environment variables
const EnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().optional(),
  NEXT_PUBLIC_FEATURE_ALPHA: z.string().optional().transform(v => v === "true"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error);
  throw new Error("Environment validation failed");
}

// set default API URL for non-production environments
const apiUrl =
  parsed.data.NEXT_PUBLIC_API_URL ??
  (isProd ? undefined : "http://127.0.0.1:8000");

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be set in production");
}

export const config = {
  apiUrl,
  featureAlpha: Boolean(parsed.data.NEXT_PUBLIC_FEATURE_ALPHA),
} as const;
