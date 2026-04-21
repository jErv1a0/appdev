import AsyncStorage from '@react-native-async-storage/async-storage';
import { call, put, takeLatest } from 'redux-saga/effects';
import { getMe, loginUser, registerUser, setAuthToken } from '../../api/auth';
import {
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

const TOKEN_STORAGE_KEY = 'token';

function* initAuthWorker() {
  try {
    const token: string | null = yield call([AsyncStorage, 'getItem'], TOKEN_STORAGE_KEY);

    if (!token) {
      yield put(initAuthSuccess(null, null));
      return;
    }

    setAuthToken(token);

    try {
      const meResponse: { user?: unknown } = yield call(getMe);
      yield put(initAuthSuccess(token, (meResponse?.user as any) ?? null));
    } catch {
      // If profile lookup fails we still keep the existing token to avoid forced logout loops.
      yield put(initAuthSuccess(token, null));
    }
  } catch (error: any) {
    yield put(initAuthFailure(error?.message || 'Failed to initialize auth'));
  }
}

function* loginWorker(action: AuthAction) {
  if (action.type !== LOGIN_REQUEST) {
    return;
  }

  try {
    const response: { token?: string; user?: unknown; error?: string; message?: string } = yield call(
      loginUser,
      action.payload.email,
      action.payload.password,
    );

    if (!response?.token) {
      const message = response?.error || response?.message || 'Invalid credentials';
      yield put(loginFailure(String(message)));
      return;
    }

    setAuthToken(response.token);
    yield call([AsyncStorage, 'setItem'], TOKEN_STORAGE_KEY, response.token);
    yield put(loginSuccess(response.token, (response.user as any) ?? null));
  } catch (error: any) {
    const message = error?.response?.data?.error || error?.message || 'Login failed';
    yield put(loginFailure(String(message)));
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
  setAuthToken(null);
  yield call([AsyncStorage, 'removeItem'], TOKEN_STORAGE_KEY);
  yield put(logoutSuccess());
}

export default function* authSaga() {
  yield takeLatest(INIT_AUTH_REQUEST, initAuthWorker);
  yield takeLatest(LOGIN_REQUEST, loginWorker);
  yield takeLatest(REGISTER_REQUEST, registerWorker);
  yield takeLatest(LOGOUT_REQUEST, logoutWorker);
}
