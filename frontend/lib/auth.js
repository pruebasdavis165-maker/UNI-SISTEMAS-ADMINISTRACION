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

/**
 * Normaliza nombres de roles para prevenir inconsistencias de tildes o mayúsculas
 */
export function normalizeRole(role) {
  if (!role) return '';
  const clean = String(role).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean === 'admin' || clean === 'administrador') return 'Admin';
  if (clean === 'logistica') return 'Logística';
  if (clean === 'vendedor') return 'Vendedor';
  if (clean === 'cliente') return 'Cliente';
  return role;
}

/**
 * Determina si el rol corresponde a personal interno (Admin, Vendedor, Logística)
 */
export function isInternalRole(role) {
  const norm = normalizeRole(role);
  return norm === 'Admin' || norm === 'Vendedor' || norm === 'Logística';
}

/**
 * Decodifica de forma segura el payload de un JWT con soporte completo para Base64URL y UTF-8
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binaryStr = atob(base64);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const decodedText = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(decodedText);
  } catch (err) {
    console.warn('Advertencia: No se pudo decodificar el payload JWT:', err);
    return null;
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nicalogistics_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('nicalogistics_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    if (user && user.rol) {
      user.rol = normalizeRole(user.rol);
    }
    return user;
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export function setSession(token, user) {
  if (typeof window === 'undefined') return;
  const normalizedUser = {
    ...user,
    rol: normalizeRole(user?.rol)
  };

  localStorage.setItem('nicalogistics_token', token);
  localStorage.setItem('nicalogistics_user', JSON.stringify(normalizedUser));

  // Establecer cookies seguras para middleware de Next.js (codificadas en URI para caracteres acentuados)
  document.cookie = `nicalogistics_token=${token}; path=/; max-age=28800; SameSite=Lax`;
  document.cookie = `nicalogistics_role=${encodeURIComponent(normalizedUser.rol)}; path=/; max-age=28800; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('nicalogistics_token');
  localStorage.removeItem('nicalogistics_user');
  document.cookie = 'nicalogistics_token=; path=/; max-age=0';
  document.cookie = 'nicalogistics_role=; path=/; max-age=0';
}
