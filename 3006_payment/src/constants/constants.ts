function getEnvVariable(name: string, required = true): string {
    const value = process.env[name]

    if (required && (!value || value.trim() === "")) {
        throw new Error(`Missing required environment variable: ${name}`)
    }

    return value || ""
}

export const APP_PORT = getEnvVariable("PORT");
export const NEON_DB_URL = getEnvVariable("NEON_DB_URL");
export const RAZORPAY_KEY_ID = getEnvVariable("RAZORPAY_KEY_ID");
export const RAZORPAY_KEY_SECRET = getEnvVariable("RAZORPAY_KEY_SECRET");