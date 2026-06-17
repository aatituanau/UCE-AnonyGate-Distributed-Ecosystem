import { Outlet, Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">Anony<span className="text-blue-600">Gate</span></span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="hidden md:block text-sm text-slate-500 font-medium border-r border-slate-200 pr-6">
              Portal de Denuncias Universitarias
            </div>
            <Link to="/login" className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              <Lock className="w-4 h-4" />
              <span>Acceso Personal</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-12">
        <Outlet />
      </main>
    </div>
  );
}
