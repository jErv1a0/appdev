import API from './api';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthApiResponse {
  token?: string;
  user?: Record<string, unknown>;
  error?: string;
  message?: string;
}

export const registerUser = async (data: RegisterPayload): Promise<AuthApiResponse> => {
  try {
    const res = await API.post('/register', data);
    return res.data;
  } catch (err: any) {
    return err.response?.data || { error: 'Registration failed' };
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthApiResponse> => {
  try {
    const res = await API.post('/login', { email, password });
    return res.data;
  } catch (err: any) {
    return err.response?.data || { error: 'Login failed' };
  }
};

export const getMe = async (): Promise<AuthApiResponse> => {
  const res = await API.get('/me');
  return res.data;
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete API.defaults.headers.common.Authorization;
};
