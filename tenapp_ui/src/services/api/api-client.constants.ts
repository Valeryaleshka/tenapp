export const API_BASE_URL = '/api'
export const REFRESH_ENDPOINTS = ['/auth/refresh'] as const
export const REFRESH_EXCLUDED_ENDPOINTS = [
  '/auth/me',
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const
export const JSON_HEADERS = {
  'Content-Type': 'application/json',
}
