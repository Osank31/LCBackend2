function getEnvVariable(name: string, required = true): string {
  const value = process.env[name]

  if (required && (!value || value.trim() === "")) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value || ""
}

export const APP_PORT = getEnvVariable("PORT")
export const MONGODB_URL = getEnvVariable("MONGODB_URL")
export const MAIL_SERVICE_URL = getEnvVariable("MAIL_SERVICE_URL")
export const ACCESS_TOKEN_JWT_KEY = getEnvVariable("ACCESS_TOKEN_JWT_KEY")
export const REFRESH_TOKEN_JWT_KEY = getEnvVariable("REFRESH_TOKEN_JWT_KEY")