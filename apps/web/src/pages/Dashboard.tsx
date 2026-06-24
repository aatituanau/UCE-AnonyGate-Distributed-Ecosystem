import { useState, useEffect } from 'react';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, ShieldCheck, Activity, User, ArrowRight, Server, FileText, X } from 'lucide-react';
import { authApi, adminApi } from '../services/api';
import { io } from 'socket.io-client';

interface TokenPayload {
  email: string;
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export default function Dashboard() {
  const [tokenData, setTokenData] = useState<TokenPayload | null>(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [stats, setStats] = useState({ 
    activeComplaints: 0, 
    reviewComplaints: 0, 
    awaitingInfoComplaints: 0,
    closedComplaints: 0,
    rejectedComplaints: 0,
    activeAnalysts: 0 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();

    // Setup WebSockets for Real-Time Metrics Update
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Force the use of the same origin (same port as the frontend, e.g. 8080) to route through the correct Nginx proxy
    const baseUrl = import.meta.env.PROD ? window.location.origin : 'http://localhost:3006';
    const socket = io(baseUrl, {
      path: '/ws/status',
      auth: { token }
    });

    socket.on('new_complaint', () => {
      fetchStats();
    });

    socket.on('status_updated', () => {
      fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const res = await authApi.post('/auth/refresh', {
        email: tokenData?.email,
        refresh_token: refreshToken
      });

      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      const payload = JSON.parse(atob(res.data.access_token.split('.')[1])) as TokenPayload;
      setTokenData(payload);

      setSuccessMsg('Tokens rotados exitosamente. ¡La seguridad funciona!');
      setTimeout(() => setSuccessMsg(''), 4000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error refrescando token. Inicia sesión de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = tokenData?.role?.toLowerCase() === 'admin';

  return (
    <div className="animate-fade-in w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h2>
          <p className="text-gray-500">Resumen del estado del ecosistema distribuido.</p>
        </div>
        {tokenData && (
          <div className="bg-[#0033A0]/10 border border-[#0033A0]/20 px-4 py-2 rounded-xl flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#0033A0] animate-pulse"></div>
            <span className="text-sm font-bold text-[#0033A0] uppercase tracking-wider">{tokenData.role}</span>
          </div>
        )}
      </div>

      {/* Workload Metrics Row */}
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Carga de Trabajo Actual</h3>
      <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-8`}>
        <div className="card-premium p-6 flex items-center border-l-4 border-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mr-4">
            <Activity className="w-7 h-7 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recibidas</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.activeComplaints}</h3>
          </div>
        </div>
        <div className="card-premium p-6 flex items-center border-l-4 border-amber-400">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mr-4">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">En Revisión</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.reviewComplaints}</h3>
          </div>
        </div>
        <div className="card-premium p-6 flex items-center border-l-4 border-orange-400">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mr-4">
            <AlertTriangle className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Esperando Info</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.awaitingInfoComplaints}</h3>
          </div>
        </div>
        {isAdmin && (
          <div className="card-premium p-6 flex items-center border-l-4 border-[#0033A0]">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mr-4">
              <ShieldCheck className="w-7 h-7 text-[#0033A0]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analistas</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.activeAnalysts}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Historical Metrics Row */}
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Histórico (Total)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card-premium p-6 flex items-center border-l-4 border-indigo-500 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mr-4">
            <CheckCircle className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cerradas (Resueltas)</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.closedComplaints}</h3>
          </div>
        </div>
        <div className="card-premium p-6 flex items-center border-l-4 border-rose-500 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mr-4">
            <X className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rechazadas</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.rejectedComplaints}</h3>
          </div>
        </div>
      </div>

      {/* Profile & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card-premium p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-[#0033A0]" />
              <span>Perfil del Oficial de Cumplimiento</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Correo Institucional</span>
                <div className="text-slate-800 font-medium text-lg">
                  {tokenData?.email || 'Cargando...'}
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Nivel de Acceso</span>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span className="text-slate-800 font-medium text-lg capitalize">
                    {tokenData?.role === 'admin' ? 'Administrador Global' : 'Analista Revisor'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Server className="w-4 h-4 text-green-500" />
              <span>Conexión segura al cluster de microservicios establecida.</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="text-sm font-bold text-[#0033A0] hover:text-blue-800 flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Renovar Sesión Segura</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-premium p-6 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50">
          <div>
            <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#0033A0]" />
              <span>Acciones Rápidas</span>
            </h3>
            <div className="space-y-3">
              <a href="/backoffice/complaints" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all rounded-xl group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700">Revisar Denuncias</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </a>

              {isAdmin && (
                <a href="/backoffice/analysts" className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all rounded-xl group cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-700">Gestionar Analistas</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </a>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            {successMsg && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm animate-fade-in flex space-x-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in flex space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
