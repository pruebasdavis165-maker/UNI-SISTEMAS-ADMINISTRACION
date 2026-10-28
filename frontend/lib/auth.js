'use client';

function getCleanApiUrl() {
  let url = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (url.endsWith('/api')) url = url.slice(0, -4);
  return url;
}

export const API_BASE_URL = typeof window !== 'undefined'
  ? getCleanApiUrl()
  : (getCleanApiUrl() || 'http://backend-api:5000');

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nicalogistics_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('nicalogistics_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export function setSession(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('nicalogistics_token', token);
  localStorage.setItem('nicalogistics_user', JSON.stringify(user));
  // Set cookie for middleware access
  document.cookie = `nicalogistics_token=${token}; path=/; max-age=28800; SameSite=Lax`;
  document.cookie = `nicalogistics_role=${user.rol}; path=/; max-age=28800; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('nicalogistics_token');
  localStorage.removeItem('nicalogistics_user');
  document.cookie = 'nicalogistics_token=; path=/; max-age=0';
  document.cookie = 'nicalogistics_role=; path=/; max-age=0';
}
