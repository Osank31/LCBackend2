function getEnvVariable(name: string, required = true): string {
  const value = process.env[name]

  if (required && (!value || value.trim() === "")) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value || ""
}

export const APP_PORT = getEnvVariable("PORT")
export const MAIL_USER = getEnvVariable("MAIL_USER")
export const MAIL_PASSWORD = getEnvVariable("MAIL_PASSWORD")