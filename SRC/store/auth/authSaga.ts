import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { call, put, takeLatest } from 'redux-saga/effects';
import { getMe, googleLogin, loginUser, registerUser, setAuthToken } from '../../api/auth';
import {
  GOOGLE_LOGIN_REQUEST,
  INIT_AUTH_REQUEST,
  LOGIN_REQUEST,
  LOGOUT_REQUEST,
  REGISTER_REQUEST,
  AuthAction,
  initAuthFailure,
  initAuthSuccess,
  loginFailure,
  loginSuccess,
  registerFailure,
  registerSuccess,
  logoutSuccess,
} from './authReducer';
import { clearAuthSession, loadAuthSession, saveAuthSession } from './authSession';
import { ENV } from '../../config/env';

let googleConfigured = false;

function ensureGoogleSigninConfigured() {
  if (googleConfigured || !ENV.GOOGLE_CLIENT_ID) {
    return;
  }

  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
    scopes: ['profile', 'email'],
  });
  googleConfigured = true;
}

function formatGoogleSigninError(error: any) {
  const message = String(error?.message || error || 'Google sign-in failed');
  const androidPackage = 'com.staygrid';
  const debugSha1 = '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';

  if (message.includes('DEVELOPER_ERROR')) {
    return `Google Sign-In failed for Android package ${androidPackage}. Register the package and SHA-1 ${debugSha1} in Firebase/Google Cloud, then download an updated google-services.json.`;
  }

  if (message.includes('12500') || message.includes('ApiException: 10')) {
    return 'Google Sign-In setup is incomplete for this Android build. Check the Firebase Android OAuth client and SHA-1 registration.';
  }

  return message;
}

function* initAuthWorker() {
  try {
    const session: { token: string | null; user: unknown | null } = yield call(loadAuthSession);
    console.log('[Auth] initAuthWorker: Loaded session', { hasToken: !!session.token, hasUser: !!session.user });

    if (!session.token && !session.user) {
      console.log('[Auth] initAuthWorker: No session found, proceeding as guest');
      yield put(initAuthSuccess(null, null));
      return;
    }

    setAuthToken(session.token);
    console.log('[Auth] initAuthWorker: Set token in client');

    let resolvedUser = session.user;
    if (!resolvedUser && session.token) {
      console.log('[Auth] initAuthWorker: User not cached, fetching from /api/me');
      try {
        const meResponse: { user?: unknown } = yield call(getMe);
        resolvedUser = (meResponse?.user as any) ?? null;
        console.log('[Auth] initAuthWorker: Got user from /api/me', { hasUser: !!resolvedUser });
      } catch (err: any) {
        console.log('[Auth] initAuthWorker: Failed to fetch /api/me', { status: err?.status, message: err?.message });
        resolvedUser = null;
      }
    }

    if (!resolvedUser) {
      console.log('[Auth] initAuthWorker: No valid user, clearing session');
      yield call(clearAuthSession);
      setAuthToken(null);
      yield put(initAuthSuccess(null, null));
      return;
    }

    console.log('[Auth] initAuthWorker: Session valid, logging in user');
    yield put(initAuthSuccess(session.token, resolvedUser as any));
  } catch (error: any) {
    console.log('[Auth] initAuthWorker: Unexpected error', { message: error?.message });
    yield put(initAuthFailure(error?.message || 'Failed to initialize auth'));
  }
}

function* loginWorker(action: AuthAction) {
  if (action.type !== LOGIN_REQUEST) {
    return;
  }

  try {
    const response: { token?: string; access_token?: string; user?: unknown; error?: string; message?: string } = yield call(
      loginUser,
      action.payload.email,
      action.payload.password,
    );

    console.log('[Auth] loginWorker: login response', response);
    const token = response.token ?? response.access_token ?? null;

    if (!token && !response?.user) {
      const message = response?.error || response?.message || 'Invalid credentials';
      yield put(loginFailure(String(message)));
      return;
    }

    console.log('[Auth] loginWorker: setting auth token', {
      hasToken: Boolean(token),
      tokenLength: token?.length ?? 0,
      hasUser: Boolean(response.user),
    });

    setAuthToken(token);

    let resolvedUser = (response.user as any) ?? null;
    if (!resolvedUser && token) {
      console.log('[Auth] loginWorker: User data missing from login response, fetching profile...');
      try {
        const meResponse: { user?: unknown } = yield call(getMe);
        resolvedUser = (meResponse?.user as any) ?? meResponse ?? null;
        console.log('[Auth] loginWorker: Fetched user profile', { hasUser: !!resolvedUser });
      } catch (profileError) {
        console.log('[Auth] loginWorker: Profile fetch failed', profileError);
      }
    }

    yield call(saveAuthSession, token, resolvedUser);
    yield put(loginSuccess(token, resolvedUser));
  } catch (error: any) {
    const message = error?.response?.data?.error || error?.message || 'Login failed';
    yield put(loginFailure(String(message)));
  }
}

function* googleLoginWorker() {
  try {
    ensureGoogleSigninConfigured();
    yield call([GoogleSignin, GoogleSignin.hasPlayServices], { showPlayServicesUpdateDialog: true });
    const googleUser: { idToken?: string | null; serverAuthCode?: string | null } = yield call([
      GoogleSignin,
      GoogleSignin.signIn,
    ]);
    let idToken = googleUser?.idToken;

    console.log('GoogleSignin.signIn result', {
      hasIdToken: Boolean(googleUser?.idToken),
      hasServerAuthCode: Boolean(googleUser?.serverAuthCode),
    });

    if (!idToken) {
      try {
        const tokens: { idToken?: string | null; accessToken?: string | null } = yield call([
          GoogleSignin,
          GoogleSignin.getTokens,
        ]);
        idToken = tokens?.idToken ?? null;
        console.log('GoogleSignin.getTokens result', {
          hasIdToken: Boolean(tokens?.idToken),
          hasAccessToken: Boolean(tokens?.accessToken),
        });
      } catch (tokenError) {
        console.log('GoogleSignin.getTokens failed', tokenError);
        idToken = null;
      }
    }

    if (!idToken) {
      yield put(
        loginFailure(
          'Google sign-in did not return an ID token. Ensure GOOGLE_CLIENT_ID is your Web OAuth client ID and your Android OAuth client is configured for com.staygrid with the proper SHA-1.',
        ),
      );
      return;
    }

    const response: { token?: string; access_token?: string; user?: unknown; error?: string; message?: string } = yield call(
      googleLogin,
      idToken,
    );

    console.log('googleLoginWorker: backend response', response);

    if (response?.error) {
      yield put(loginFailure(response.error));
      return;
    }

    const token = response.token ?? response.access_token ?? null;

    if (!token) {
      console.log('[Auth] googleLoginWorker: Backend did not return a valid token');
      yield put(loginFailure('Google login succeeded but backend did not return an access token. Contact support if this persists.'));
      return;
    }

    console.log('[Auth] googleLoginWorker: Got backend token', { tokenLength: token.length, hasUser: !!response.user });

    setAuthToken(token);

    let resolvedUser = (response.user as any) ?? null;
    if (!resolvedUser && token) {
      console.log('[Auth] googleLoginWorker: User data missing from login response, fetching profile...');
      try {
        const meResponse: { user?: unknown } = yield call(getMe);
        resolvedUser = meResponse?.user ?? meResponse ?? null;
        console.log('[Auth] googleLoginWorker: Fetched user profile', { hasUser: !!resolvedUser });
      } catch (profileError) {
        console.log('[Auth] googleLoginWorker: Profile fetch failed', profileError);
      }
    }

    yield call(saveAuthSession, token, resolvedUser);
    yield put(loginSuccess(token, resolvedUser));
  } catch (error: any) {
    yield put(loginFailure(formatGoogleSigninError(error)));
  }
}

function* registerWorker(action: AuthAction) {
  if (action.type !== REGISTER_REQUEST) {
    return;
  }

  try {
    const response: { error?: string; message?: string } = yield call(registerUser, {
      email: action.payload.email,
      password: action.payload.password,
      fullName: action.payload.fullName,
    });

    if (response?.error) {
      yield put(registerFailure(response.error));
      return;
    }

    yield put(registerSuccess());
  } catch (error: any) {
    const message = error?.response?.data?.error || error?.message || 'Registration failed';
    yield put(registerFailure(String(message)));
  }
}

function* logoutWorker() {
  try {
    yield call(clearAuthSession);
  } finally {
    setAuthToken(null);
  }
  yield put(logoutSuccess());
}

export default function* authSaga() {
  yield takeLatest(INIT_AUTH_REQUEST, initAuthWorker);
  yield takeLatest(LOGIN_REQUEST, loginWorker);
  yield takeLatest(GOOGLE_LOGIN_REQUEST, googleLoginWorker);
  yield takeLatest(REGISTER_REQUEST, registerWorker);
  yield takeLatest(LOGOUT_REQUEST, logoutWorker);
}
