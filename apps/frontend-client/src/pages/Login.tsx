import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login({ setAuth }: { setAuth: (val: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_AUTH = import.meta.env.VITE_API_AUTH_URL || 'http://localhost:3000';
      const response = await axios.post(`${API_AUTH}/auth/login`, {
        email,
        password
      });

      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        setAuth(true);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in pt-10">
      <div className="glass rounded-3xl p-8 w-full max-w-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg shadow-black/20">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Bienvenido de vuelta</h2>
            <p className="text-white/50">Ingresa tus credenciales para acceder al sistema de denuncias.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start space-x-3 text-danger animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2 pl-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium pl-11"
                  placeholder="admin@uce.edu.ec"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2 pl-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
