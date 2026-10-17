import type { CookieOptions } from 'express';

export const REFRESH_COOKIE_NAME = 'refresh_token';

// httpOnly: JavaScript in the browser can't read it (protects against XSS)
// secure: only sent over HTTPS (turned off in development, where we use plain http)
// sameSite strict: never sent from other websites (protects against CSRF)
// path: only sent to /auth routes, not with every request
export function refreshCookieOptions(isProduction: boolean, ttlDays: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/auth',
    maxAge: ttlDays * 24 * 60 * 60 * 1000,
  };
}
