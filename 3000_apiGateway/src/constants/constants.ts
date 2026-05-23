function getEnvVariable(name: string, required = true): string {
  const value = process.env[name]

  if (required && (!value || value.trim() === "")) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value || ""
}

export const APP_PORT = getEnvVariable("PORT")
export const ACCESS_TOKEN_JWT_KEY = getEnvVariable("ACCESS_TOKEN_JWT_KEY")
export const AUTH_SERVICE_URL = getEnvVariable("AUTH_SERVICE_URL")
export const PROBLEM_SERVICE_URL = getEnvVariable("PROBLEM_SERVICE_URL")
export const SUBMISSION_SERVICE_URL = getEnvVariable("SUBMISSION_SERVICE_URL")