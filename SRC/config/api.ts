import { ENV } from './env';

function removeTrailingSlash(value: string): string {
	return value.endsWith('/') ? value.slice(0, -1) : value;
}

export const API_BASE_URL = removeTrailingSlash(ENV.APP_URL || ENV.DEFAULT_URI);

export default {
	baseUrl: API_BASE_URL,
};
