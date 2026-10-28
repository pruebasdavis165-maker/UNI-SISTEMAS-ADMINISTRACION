import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'NicaLogistics - Comercio Bilateral y Logística Miami ⇄ Managua',
  description: 'Sistema empresarial de comercio electrónico y gestión logística de envíos Sede a Sede Miami ⇄ Nicaragua. Retiro seguro en ventanilla.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col font-inter bg-slate-50 text-slate-900 antialiased selection:bg-primary-blue selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
