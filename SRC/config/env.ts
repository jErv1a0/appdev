import {
  APP_DEBUG,
  APP_ENV,
  APP_PORT,
  APP_URL,
  DEFAULT_URI,
} from '@env';

type AppEnv = {
  APP_ENV: string;
  APP_DEBUG: boolean;
  DEFAULT_URI: string;
  APP_URL: string;
  APP_PORT: number;
};

function parseBoolean(value?: string) {
  return value === '1' || value?.toLowerCase() === 'true';
}

function parsePort(value?: string, fallback = 8080) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Keep app-level runtime config centralized here for React Native usage.
export const ENV: AppEnv = {
  APP_ENV: APP_ENV ?? 'dev',
  APP_DEBUG: parseBoolean(APP_DEBUG),
  DEFAULT_URI: DEFAULT_URI ?? 'https://nonintoxicant-billi-unattendant.ngrok-free.dev',
  APP_URL: APP_URL ?? 'https://nonintoxicant-billi-unattendant.ngrok-free.dev',
  APP_PORT: parsePort(APP_PORT),
};

export default ENV;
