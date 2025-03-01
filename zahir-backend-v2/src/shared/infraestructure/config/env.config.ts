import dotenv from "dotenv";
import path from "path";

function getEnvPath() {
  const env = process.env.NODE_ENV || "development";
  const envMap = {
    development: ".env.development",
    test: ".env.test",
    production: ".env",
  };

  return envMap[env as keyof typeof envMap] || ".env";
}

export function loadEnvConfig() {
  const envFile = getEnvPath();
  const envPath = path.resolve(process.cwd(), envFile);

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    throw new Error(
      `Error loading environment variables from ${envFile}: ${result.error.message}`
    );
  }

  const requiredEnvVars = [
    "PORT",
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_ACCESS_EXPIRATION",
    "JWT_REFRESH_EXPIRATION",
    "SALT_ROUNDS",
    "COOKIE_SECRET",
    "PASSWORD_PEPPER",
  ];

  const missingEnvVars = requiredEnvVars.filter((env) => !process.env[env]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
  }

  console.log(`Loaded environment variables from ${envFile}`);
}
