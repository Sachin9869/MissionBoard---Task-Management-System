import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  console.log('AuthInterceptor: token exists:', !!token);

  if (token && !isTokenExpired()) {
    console.log('AuthInterceptor: Adding token to request', req.url);
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  console.log('AuthInterceptor: No token or token expired for request', req.url);
  return next(req);
};

function isTokenExpired(): boolean {
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) {
    console.log('AuthInterceptor: No token expiry found, treating as not expired');
    return false; // If no expiry is set, assume token is valid
  }

  const isExpired = new Date() >= new Date(expiry);
  console.log('AuthInterceptor: Token expired:', isExpired);
  return isExpired;
}