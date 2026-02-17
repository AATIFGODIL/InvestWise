export function getEnvVar(key: string): string | undefined {
    // 1. Try direct process.env (local dev or individual vars)
    if (process.env[key]) {
        return process.env[key];
    }

    // 2. Try parsing APP_SECRETS (consolidated secret for production)
    if (process.env.APP_SECRETS) {
        try {
            const secrets = JSON.parse(process.env.APP_SECRETS);
            if (secrets[key]) {
                return secrets[key];
            }
        } catch (error) {
            console.error('Failed to parse APP_SECRETS environment variable', error);
        }
    }

    return undefined;
}

export function getRequiredEnvVar(key: string): string {
    const value = getEnvVar(key);
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
