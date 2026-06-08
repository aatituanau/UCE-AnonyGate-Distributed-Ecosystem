import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [tokenData, setTokenData] = useState<Record<string, unknown> | null>(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        console.error("Failed to parse token", e);
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const email = tokenData?.email;
      const refreshToken = localStorage.getItem('refresh_token');

      const API_AUTH = import.meta.env.VITE_API_AUTH_URL || 'http://localhost:3000';
      const res = await axios.post(`${API_AUTH}/auth/refresh`, {
        email,
        refresh_token: refreshToken
      });

      // Update local storage with new tokens
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);

      // Update state
      const payload = JSON.parse(atob(res.data.access_token.split('.')[1]));
      setTokenData(payload);

      setSuccessMsg('Tokens rotados exitosamente. ¡La seguridad funciona!');
      setTimeout(() => setSuccessMsg(''), 4000);

    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error refrescando token. Por favor inicia sesión de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto pt-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center space-x-3 mb-2">
            <Shield className="text-primary w-8 h-8" />
            <span>
              {tokenData?.role === 'admin' ? 'Panel de Administración' : 'Panel de Analista'}
            </span>
          </h2>
          <p className="text-white/50">
            {tokenData?.role === 'admin'
              ? 'Bienvenido al área de gestión central del ecosistema.'
              : 'Bienvenido a tu área de revisión de casos y denuncias.'}
          </p>
        </div>

        {tokenData && (
          <div className="bg-primary/20 border border-primary/30 px-4 py-2 rounded-xl flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{tokenData.role}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Token Info Card */}
        <div className="glass rounded-3xl p-6 md:col-span-2 relative overflow-hidden">
          <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-4">Identidad Verificada</h3>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Usuario</span>
              <div className="font-mono bg-black/30 px-3 py-2 rounded-lg border border-white/5">{tokenData?.email || 'Cargando...'}</div>
            </div>

            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">ID (Sub)</span>
              <div className="font-mono bg-black/30 px-3 py-2 rounded-lg border border-white/5 text-sm text-white/70">{tokenData?.sub || 'Cargando...'}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Emitido (IAT)</span>
                <div className="font-mono bg-black/30 px-3 py-2 rounded-lg border border-white/5 text-sm text-white/70">
                  {tokenData?.iat ? new Date(tokenData.iat * 1000).toLocaleTimeString() : '...'}
                </div>
              </div>
              <div>
                <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">Expira (EXP)</span>
                <div className="font-mono bg-black/30 px-3 py-2 rounded-lg border border-white/5 text-sm text-white/70">
                  {tokenData?.exp ? new Date(tokenData.exp * 1000).toLocaleTimeString() : '...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <Clock className="w-12 h-12 text-accent mb-4 opacity-50" />
          <h3 className="font-bold mb-2">Rotación de Tokens</h3>
          <p className="text-sm text-white/50 mb-6">Prueba el endpoint de refresh token de ms-auth.</p>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary w-full flex justify-center items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar Sesión</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 flex items-start space-x-3 text-secondary animate-fade-in mb-6">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start space-x-3 text-danger animate-fade-in mb-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

    </div>
  );
}
