import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, LogOut, LayoutDashboard, Users, AlertCircle } from 'lucide-react';

export default function PrivateLayout() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  const getTokenData = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch {
        return null;
      }
    }
    return null;
  };

  const tokenData = getTokenData();
  const isAdmin = tokenData?.role === 'admin';

  // Base items for any logged in user (Analyst or Admin)
  const menuItems = [
    { path: '/dashboard', label: 'Resumen', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/complaints', label: 'Denuncias', icon: <AlertCircle className="w-5 h-5" /> },
  ];

  // Admin-only items
  if (isAdmin) {
    menuItems.push({ path: '/admin/analysts', label: 'Analistas', icon: <Users className="w-5 h-5" /> });
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Private Sidebar */}
      <aside className="w-72 bg-white flex flex-col border-r border-slate-200 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
            <Shield className="text-blue-600 w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-wide">Backoffice</h1>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sesión Activa</p>
          <p className="text-sm font-medium text-slate-700 truncate">{tokenData?.email || 'Usuario'}</p>
          <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-1 rounded-md bg-blue-50 border border-blue-100">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            <span className="text-[10px] font-bold text-blue-700 uppercase">{tokenData?.role || 'ANALISTA'}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Gestión</p>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <div className="p-8 w-full max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
