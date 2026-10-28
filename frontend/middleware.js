import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('nicalogistics_token')?.value;
  const role = request.cookies.get('nicalogistics_role')?.value;

  // Rutas protegidas que requieren autenticación
  const isAuthRequired = pathname.startsWith('/admin') || 
                         pathname.startsWith('/panel') || 
                         pathname.startsWith('/checkout') ||
                         pathname.startsWith('/pedidos');

  if (isAuthRequired) {
    if (!token) {
      // Política 2: Redirección automática si no hay token o expiró
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validación de roles estrictos
    // Rutas exclusivas de Administrador
    if (pathname.startsWith('/admin')) {
      if (role !== 'Admin') {
        // Un usuario "Cliente", "Vendedor" o "Logística" debe ser redirigido a 403
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }

    // Rutas operativas de empleados (Admin, Vendedor, Logística)
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
