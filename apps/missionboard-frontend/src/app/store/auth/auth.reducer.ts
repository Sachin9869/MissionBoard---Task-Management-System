import { createReducer, on } from '@ngrx/store';
import { UserInfo } from '../../../../../../../libs/shared/ts/models';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { loginResponse }) => ({
    ...state,
    user: loginResponse.user,
    token: loginResponse.accessToken,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error,
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.logoutSuccess, () => ({
    ...initialState,
  })),

  // Token Management
  on(AuthActions.loadTokenFromStorage, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.tokenExpired, () => ({
    ...initialState,
    error: 'Your session has expired. Please log in again.',
  })),

  // User Info
  on(AuthActions.loadUserInfo, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.loadUserInfoSuccess, (state, { userInfo }) => ({
    ...state,
    user: userInfo,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loadUserInfoFailure, (state, { error }) => ({
    ...state,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error,
  })),

  // Clear Error
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  }))
);