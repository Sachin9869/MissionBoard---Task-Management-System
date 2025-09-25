import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectUserRoles = createSelector(
  selectUser,
  (user) => user?.roles || []
);

export const selectUserRights = createSelector(
  selectUser,
  (user) => user?.rights || []
);

export const selectIsAdmin = createSelector(
  selectUserRoles,
  (roles) => roles.includes('Admin')
);

export const selectIsManager = createSelector(
  selectUserRoles,
  (roles) => roles.includes('Manager')
);

export const selectCanCreateTasks = createSelector(
  selectUserRights,
  (rights) => rights.includes('task.create')
);

export const selectCanAssignTasks = createSelector(
  selectUserRights,
  (rights) => rights.includes('task.assign')
);

export const selectCanUpdateTaskStatus = createSelector(
  selectUserRights,
  (rights) => rights.includes('task.update_status')
);

export const selectCanViewAllTasks = createSelector(
  selectUserRights,
  (rights) => rights.includes('task.view_all')
);