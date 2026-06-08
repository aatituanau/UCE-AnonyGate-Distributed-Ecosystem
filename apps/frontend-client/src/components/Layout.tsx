import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, User, LogOut, FileText } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col z-10 relative">
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              AnonyGate
            </h1>
          </div>

          <nav className="flex space-x-6 items-center">
            <Link
              to="/denounce"
              className={`flex items-center space-x-2 font-medium transition-colors ${location.pathname === '/denounce' ? 'text-primary' : 'text-white/70 hover:text-white'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Denunciar</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-primary' : 'text-white/70 hover:text-white'}`}
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white/70 hover:text-danger transition-colors font-medium ml-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary py-2 px-5 flex items-center space-x-2 ml-4"
              >
                <User className="w-4 h-4" />
                <span>Ingresar</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
