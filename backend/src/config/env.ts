import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
);

loadDotenv({ path: path.join(repoRoot, ".env") });

export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  const databaseUrl = requireEnv("DATABASE_URL");

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.BACKEND_PORT ?? "3001"),
    databaseUrl,
  };
}
