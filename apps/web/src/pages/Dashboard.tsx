import { useState, useEffect } from 'react';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Clock, ShieldCheck, Activity } from 'lucide-react';
import { authApi, adminApi } from '../services/api';

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
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [stats, setStats] = useState({ activeComplaints: 0, reviewComplaints: 0, activeAnalysts: 0 });

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

      {/* Metrics Row */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-8`}>
        <div className="card-premium p-6 flex items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mr-4">
            <Activity className="w-7 h-7 text-[#0033A0]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Denuncias Activas</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.activeComplaints}</h3>
          </div>
        </div>
        <div className="card-premium p-6 flex items-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center mr-4">
            <Clock className="w-7 h-7 text-[#F2A900]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">En Revisión</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.reviewComplaints}</h3>
          </div>
        </div>
        {isAdmin && (
          <div className="card-premium p-6 flex items-center">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mr-4">
              <ShieldCheck className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Analistas Activos</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.activeAnalysts}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Token Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-premium p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Identidad y Sesión (JWT)</h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Usuario</span>
              <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 font-medium">
                {tokenData?.email || 'Cargando...'}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Sujeto (Sub)</span>
              <div className="font-mono text-xs bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600">
                {tokenData?.sub || 'Cargando...'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Emitido (IAT)</span>
                <div className="font-mono bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">
                  {tokenData?.iat ? new Date(tokenData.iat * 1000).toLocaleTimeString() : '...'}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Expira (EXP)</span>
                <div className="font-mono bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">
                  {tokenData?.exp ? new Date(tokenData.exp * 1000).toLocaleTimeString() : '...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-premium p-6 flex flex-col items-center text-center justify-center bg-gradient-to-b from-white to-gray-50">
          <Shield className="w-12 h-12 text-[#0033A0] mb-4 opacity-80" />
          <h3 className="font-bold text-gray-900 mb-2">Rotación de Tokens</h3>
          <p className="text-sm text-gray-500 mb-6">El sistema rota automáticamente el access token mediante tu refresh token almacenado.</p>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar Sesión</span>
          </button>

          {successMsg && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm animate-fade-in w-full text-left flex space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm animate-fade-in w-full text-left flex space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
