import { NextResponse } from 'next/server';

function normalizeRole(role) {
  if (!role) return '';
  const clean = String(role).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean === 'admin' || clean === 'administrador') return 'Admin';
  if (clean === 'logistica') return 'Logística';
  if (clean === 'vendedor') return 'Vendedor';
  if (clean === 'cliente') return 'Cliente';
  return role;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('nicalogistics_token')?.value;
  const rawRole = request.cookies.get('nicalogistics_role')?.value;
  const role = rawRole ? normalizeRole(decodeURIComponent(rawRole)) : null;

  // Rutas protegidas que requieren autenticación
  const isAuthRequired = pathname.startsWith('/admin') || 
                         pathname.startsWith('/panel') || 
                         pathname.startsWith('/checkout') ||
                         pathname.startsWith('/pedidos');

  if (isAuthRequired) {
    if (!token) {
      // Redirección si no hay token o la sesión expiró
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rutas exclusivas de Administrador
    if (pathname.startsWith('/admin') || 
        pathname.startsWith('/panel/usuarios') || 
        pathname.startsWith('/panel/sedes')) {
      if (role !== 'Admin') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }

    // Rutas operativas de personal interno (Admin, Vendedor, Logística)
    if (pathname.startsWith('/panel')) {
      if (role === 'Cliente') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/panel/:path*',
    '/checkout/:path*',
    '/pedidos/:path*'
  ],
};
