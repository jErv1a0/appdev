import client, { setAuthToken as setClientAuthToken } from './client';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface UserGoogleLoginPayload {
  token: string;
}

export interface UserGoogleLoginResponse {
  [key: string]: any;
  error?: string;
}

export interface AuthApiResponse {
  user?: Record<string, unknown>;
  token?: string;
  access_token?: string;
  id_token?: string;
  api_token?: string;
  accessToken?: string;
  auth_token?: string;
  error?: string;
  message?: string;
}

function extractAuthToken(response: any): string | null {
  return (
    response?.token ||
    response?.access_token ||
    response?.id_token ||
    response?.api_token ||
    response?.accessToken ||
    response?.auth_token ||
    null
  );
}

export const registerUser = async (data: RegisterPayload): Promise<AuthApiResponse> => {
  try {
    const res = await client.request('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  } catch (err: any) {
    return err.body || { error: 'Registration failed' };
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthApiResponse> => {
  try {
    const res = await client.login(email, password);
    return {
      ...res,
      token: extractAuthToken(res),
    };
  } catch (err: any) {
    return err.body || { error: 'Login failed' };
  }
};

export const getMe = async (): Promise<AuthApiResponse> => {
  try {
    const res = await client.request('/api/user/profile');
    return res;
  } catch (err: any) {
    throw err;
  }
};

export const googleLogin = async (idToken: string): Promise<AuthApiResponse> => {
  const postPaths = ['/api/auth/google/mobile', '/api/auth/google'];

  try {
    console.log('googleLogin: sending idToken length', idToken?.length);
    for (const path of postPaths) {
      try {
        const res = await client.request(path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        });
        const normalizedResponse = {
          ...res,
          token: extractAuthToken(res),
        };
        console.log('googleLogin: response', {
          path,
          hasToken: Boolean(normalizedResponse?.token),
          hasUser: Boolean(normalizedResponse?.user),
        });
        return normalizedResponse;
      } catch (err: any) {
        if (err?.status === 404 && path !== postPaths[postPaths.length - 1]) {
          continue;
        }

        if (err?.status === 405) {
          return {
            error:
              'Google route exists but only supports GET (browser OAuth redirect). Mobile token exchange requires a POST API endpoint (for example /api/auth/google/mobile) that accepts { token: idToken }.',
          };
        }

        const detail = (err?.body as any)?.detail;
        return { error: detail || err?.message || 'Google login failed' };
      }
    }

    return {
      error:
        'No compatible Google mobile token endpoint found. Expected POST route such as /api/auth/google/mobile.',
    };
  } catch (err: any) {
    console.log('googleLogin: error', err);
    return { error: err?.message || 'Google login failed' };
  }
};

export async function userGoogleLogin(
  payload: UserGoogleLoginPayload,
): Promise<UserGoogleLoginResponse> {
  const { token } = payload;

  try {
    const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return { error: 'Google profile request failed' };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return { error: error.message || 'An unknown error occurred' };
  }
}

export async function resolveGoogleProfile(token: string) {
  const profile = await userGoogleLogin({ token });

  if (profile.error) {
    throw new Error(profile.error);
  }

  return profile;
}

export const setAuthToken = (_: string | null): void => {
  setClientAuthToken(_);
};
