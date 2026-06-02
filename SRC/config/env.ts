import {
	APP_DEBUG,
	APP_ENV,
	APP_PORT,
	APP_URL,
	GOOGLE_CLIENT_ID,
	DEFAULT_URI,
} from './envValues';

type AppEnv = {
	APP_ENV: string;
	APP_DEBUG: boolean;
	DEFAULT_URI: string;
	APP_URL: string;
	APP_PORT: number;
	GOOGLE_CLIENT_ID: string;
};

function parseBoolean(value?: string) {
	return value === '1' || value?.toLowerCase() === 'true';
}

function parsePort(value?: string, fallback = 8080) {
	const parsed = Number.parseInt(value ?? '', 10);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function readValue(value?: string, fallback = '') {
	return value?.trim() || fallback;
}

export const ENV: AppEnv = {
	APP_ENV: readValue(APP_ENV, 'dev'),
	APP_DEBUG: parseBoolean(APP_DEBUG),
	DEFAULT_URI: readValue(DEFAULT_URI, 'http://10.0.2.2:8000'),
	APP_URL: readValue(APP_URL, 'http://10.0.2.2:8000'),
	APP_PORT: parsePort(APP_PORT, 8080),
	GOOGLE_CLIENT_ID: readValue(GOOGLE_CLIENT_ID),
};

export default ENV;
