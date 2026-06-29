import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, LogOut, LayoutDashboard, Users, AlertCircle, ChevronLeft, ChevronRight, FileEdit, ShieldCheck } from 'lucide-react';

export default function PrivateLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    { path: '/backoffice/complaints', label: 'Denuncias', icon: <AlertCircle className="w-5 h-5" /> },
  ];

  // Admin-only items
  if (isAdmin) {
    menuItems.push({ path: '/backoffice/analysts', label: 'Analistas', icon: <Users className="w-5 h-5" /> });
    menuItems.push({ path: '/backoffice/forms', label: 'Formularios', icon: <FileEdit className="w-5 h-5" /> });
    menuItems.push({ path: '/backoffice/audit', label: 'Auditoría', icon: <ShieldCheck className="w-5 h-5" /> });
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Private Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white flex flex-col border-r border-slate-200 z-20 transition-all duration-300 relative`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-white border border-slate-200 text-slate-500 rounded-full p-1 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-colors z-30"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-slate-100 transition-all`}>
          <div className={`w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center ${isCollapsed ? 'mr-0' : 'mr-3'}`}>
            <Shield className="text-blue-600 w-5 h-5 flex-shrink-0" />
          </div>
          {!isCollapsed && <h1 className="text-lg font-bold text-slate-800 tracking-wide truncate">Backoffice</h1>}
        </div>

        <div className={`py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col ${isCollapsed ? 'items-center px-2' : 'px-6'} transition-all`}>
          {!isCollapsed ? (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sesión Activa</p>
              <p className="text-sm font-medium text-slate-700 truncate w-full">{tokenData?.email || 'Usuario'}</p>
              <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-1 rounded-md bg-blue-50 border border-blue-100">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                <span className="text-[10px] font-bold text-blue-700 uppercase">{tokenData?.role || 'ANALISTA'}</span>
              </div>
            </>
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold uppercase" title={tokenData?.email}>
              {tokenData?.email?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-6 space-y-2 overflow-x-hidden`}>
          {!isCollapsed && <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Gestión</p>}
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2.5 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'} transition-colors`}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-slate-200 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
            className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10' : 'space-x-3 w-full px-3'} py-2.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors group`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-red-500" />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Cerrar Sesión</span>}
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
