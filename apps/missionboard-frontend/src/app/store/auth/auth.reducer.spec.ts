import { authReducer, initialState } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { UserInfo } from '../../../../../../../libs/shared/ts/models';

describe('Auth Reducer', () => {
  const mockUser: UserInfo = {
    id: '1',
    userName: 'testuser',
    email: 'test@example.com',
    roles: ['Developer'],
    rights: ['task.update_status']
  };

  const mockLoginResponse = {
    accessToken: 'mock-token',
    expiresIn: 3600,
    user: mockUser
  };

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = authReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('login actions', () => {
    it('should set loading to true on login', () => {
      const action = AuthActions.login({
        credentials: { userName: 'test', password: 'password' }
      });

      const result = authReducer(initialState, action);

      expect(result.isLoading).toBe(true);
      expect(result.error).toBe(null);
    });

    it('should set user and token on login success', () => {
      const action = AuthActions.loginSuccess({ loginResponse: mockLoginResponse });

      const result = authReducer(initialState, action);

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('mock-token');
      expect(result.isAuthenticated).toBe(true);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe(null);
    });

    it('should set error on login failure', () => {
      const action = AuthActions.loginFailure({ error: 'Invalid credentials' });

      const result = authReducer(initialState, action);

      expect(result.user).toBe(null);
      expect(result.token).toBe(null);
      expect(result.isAuthenticated).toBe(false);
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('logout actions', () => {
    it('should reset state on logout success', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        token: 'token',
        isAuthenticated: true
      };

      const action = AuthActions.logoutSuccess();
      const result = authReducer(stateWithUser, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('token expired', () => {
    it('should reset state and set error message', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        token: 'token',
        isAuthenticated: true
      };

      const action = AuthActions.tokenExpired();
      const result = authReducer(stateWithUser, action);

      expect(result.user).toBe(null);
      expect(result.token).toBe(null);
      expect(result.isAuthenticated).toBe(false);
      expect(result.error).toBe('Your session has expired. Please log in again.');
    });
  });

  describe('clear error', () => {
    it('should clear error message', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error'
      };

      const action = AuthActions.clearAuthError();
      const result = authReducer(stateWithError, action);

      expect(result.error).toBe(null);
    });
  });
});