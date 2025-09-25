import { createAction, props } from '@ngrx/store';
import { LoginRequest, LoginResponse, UserInfo } from '../../../../../../../libs/shared/ts/models';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ loginResponse: LoginResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Token Actions
export const loadTokenFromStorage = createAction('[Auth] Load Token From Storage');

export const tokenExpired = createAction('[Auth] Token Expired');

// User Info Actions
export const loadUserInfo = createAction('[Auth] Load User Info');

export const loadUserInfoSuccess = createAction(
  '[Auth] Load User Info Success',
  props<{ userInfo: UserInfo }>()
);

export const loadUserInfoFailure = createAction(
  '[Auth] Load User Info Failure',
  props<{ error: string }>()
);

// Clear Error
export const clearAuthError = createAction('[Auth] Clear Error');