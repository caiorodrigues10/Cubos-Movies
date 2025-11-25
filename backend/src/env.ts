import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  GCP_PROJECT_ID: z.string().min(1).optional(),
  GCP_BUCKET_NAME: z.string().min(1),
  // Somente modo "tipo 2": credenciais obrigatórias via variáveis de ambiente
  GCP_CLIENT_EMAIL: z.string().email(),
  GCP_PRIVATE_KEY: z.string().min(1),
  GCP_SIGNED_URL_EXPIRATION: z.coerce.number().int().positive().default(300),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
});

export const env = envSchema.parse(process.env);
export const isDevelopment = env.NODE_ENV === "development";

