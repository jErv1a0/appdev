import { ENV } from './env';

export const API_BASE_URL = ENV.APP_URL || 'https://staygrid.up.railway.app';

export default {
	baseUrl: API_BASE_URL,
};
