export const INIT_AUTH_REQUEST = 'auth/INIT_AUTH_REQUEST';
export const INIT_AUTH_SUCCESS = 'auth/INIT_AUTH_SUCCESS';
export const INIT_AUTH_FAILURE = 'auth/INIT_AUTH_FAILURE';

export const LOGIN_REQUEST = 'auth/LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE';

export const REGISTER_REQUEST = 'auth/REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'auth/REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'auth/REGISTER_FAILURE';

export const LOGOUT_REQUEST = 'auth/LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'auth/LOGOUT_SUCCESS';

export const CLEAR_AUTH_NOTICES = 'auth/CLEAR_AUTH_NOTICES';

export interface AuthUser {
  id?: string;
  email?: string;
  fullName?: string;
  [key: string]: unknown;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  registrationSuccess: boolean;
  error: string | null;
}

interface InitAuthRequestAction {
  type: typeof INIT_AUTH_REQUEST;
}

interface InitAuthSuccessAction {
  type: typeof INIT_AUTH_SUCCESS;
  payload: {
    token: string | null;
    user: AuthUser | null;
  };
}

interface InitAuthFailureAction {
  type: typeof INIT_AUTH_FAILURE;
  payload: string;
}

interface LoginRequestAction {
  type: typeof LOGIN_REQUEST;
  payload: {
    email: string;
    password: string;
  };
}

interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: {
    token: string;
    user: AuthUser | null;
  };
}

interface LoginFailureAction {
  type: typeof LOGIN_FAILURE;
  payload: string;
}

interface RegisterRequestAction {
  type: typeof REGISTER_REQUEST;
  payload: {
    email: string;
    password: string;
    fullName: string;
  };
}

interface RegisterSuccessAction {
  type: typeof REGISTER_SUCCESS;
}

interface RegisterFailureAction {
  type: typeof REGISTER_FAILURE;
  payload: string;
}

interface LogoutRequestAction {
  type: typeof LOGOUT_REQUEST;
}

interface LogoutSuccessAction {
  type: typeof LOGOUT_SUCCESS;
}

interface ClearAuthNoticesAction {
  type: typeof CLEAR_AUTH_NOTICES;
}

export type AuthAction =
  | InitAuthRequestAction
  | InitAuthSuccessAction
  | InitAuthFailureAction
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | RegisterRequestAction
  | RegisterSuccessAction
  | RegisterFailureAction
  | LogoutRequestAction
  | LogoutSuccessAction
  | ClearAuthNoticesAction;

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  initialized: false,
  isAuthenticated: false,
  registrationSuccess: false,
  error: null,
};

export function initAuthRequest(): InitAuthRequestAction {
  return { type: INIT_AUTH_REQUEST };
}

export function initAuthSuccess(token: string | null, user: AuthUser | null): InitAuthSuccessAction {
  return { type: INIT_AUTH_SUCCESS, payload: { token, user } };
}

export function initAuthFailure(payload: string): InitAuthFailureAction {
  return { type: INIT_AUTH_FAILURE, payload };
}

export function loginRequest(email: string, password: string): LoginRequestAction {
  return { type: LOGIN_REQUEST, payload: { email, password } };
}

export function loginSuccess(token: string, user: AuthUser | null): LoginSuccessAction {
  return { type: LOGIN_SUCCESS, payload: { token, user } };
}

export function loginFailure(payload: string): LoginFailureAction {
  return { type: LOGIN_FAILURE, payload };
}

export function registerRequest(
  email: string,
  password: string,
  fullName: string,
): RegisterRequestAction {
  return { type: REGISTER_REQUEST, payload: { email, password, fullName } };
}

export function registerSuccess(): RegisterSuccessAction {
  return { type: REGISTER_SUCCESS };
}

export function registerFailure(payload: string): RegisterFailureAction {
  return { type: REGISTER_FAILURE, payload };
}

export function logoutRequest(): LogoutRequestAction {
  return { type: LOGOUT_REQUEST };
}

export function logoutSuccess(): LogoutSuccessAction {
  return { type: LOGOUT_SUCCESS };
}

export function clearAuthNotices(): ClearAuthNoticesAction {
  return { type: CLEAR_AUTH_NOTICES };
}

export default function authReducer(
  state: AuthState = initialState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case INIT_AUTH_REQUEST:
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case LOGOUT_REQUEST:
      return {
        ...state,
        loading: true,
        registrationSuccess: false,
        error: null,
      };
    case INIT_AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        initialized: true,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: Boolean(action.payload.token),
      };
    case INIT_AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        initialized: true,
        error: action.payload,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        initialized: true,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        initialized: true,
        isAuthenticated: false,
        error: action.payload,
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        registrationSuccess: true,
      };
    case REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        registrationSuccess: false,
        error: action.payload,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loading: false,
        initialized: true,
        token: null,
        user: null,
        isAuthenticated: false,
      };
    case CLEAR_AUTH_NOTICES:
      return {
        ...state,
        error: null,
        registrationSuccess: false,
      };
    default:
      return state;
  }
}
