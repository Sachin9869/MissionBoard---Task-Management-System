import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((loginResponse) => {
            // Store token in localStorage
            localStorage.setItem('token', loginResponse.accessToken);
            localStorage.setItem('user', JSON.stringify(loginResponse.user));

            return AuthActions.loginSuccess({ loginResponse });
          }),
          catchError((error) =>
            of(AuthActions.loginFailure({
              error: error.error?.message || 'Login failed'
            }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ loginResponse }) => {
          // Navigate based on user role
          const primaryRole = loginResponse.user.roles[0];
          switch (primaryRole) {
            case 'Admin':
              this.router.navigate(['/admin']);
              break;
            case 'Manager':
              this.router.navigate(['/manager']);
              break;
            default:
              this.router.navigate(['/team']);
              break;
          }
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => {
            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            return AuthActions.logoutSuccess();
          }),
          catchError(() => {
            // Even if logout fails, clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            return of(AuthActions.logoutSuccess());
          })
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess, AuthActions.tokenExpired),
        tap(() => {
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );

  loadTokenFromStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadTokenFromStorage),
      switchMap(() => {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');

        if (token && userJson) {
          try {
            const user = JSON.parse(userJson);

            // Verify token is still valid by calling /me endpoint
            return this.authService.getCurrentUser().pipe(
              map((userInfo) =>
                AuthActions.loadUserInfoSuccess({ userInfo })
              ),
              catchError(() => {
                // Token is invalid, clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                return of(AuthActions.tokenExpired());
              })
            );
          } catch {
            // Invalid JSON in storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            return of(AuthActions.tokenExpired());
          }
        }

        return of(AuthActions.logoutSuccess());
      })
    )
  );

  loadUserInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserInfo),
      switchMap(() =>
        this.authService.getCurrentUser().pipe(
          map((userInfo) =>
            AuthActions.loadUserInfoSuccess({ userInfo })
          ),
          catchError((error) =>
            of(AuthActions.loadUserInfoFailure({
              error: error.error?.message || 'Failed to load user info'
            }))
          )
        )
      )
    )
  );
}