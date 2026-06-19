import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertTriangle, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';

interface LoginProps {
  setAuth: (val: boolean) => void;
}

export default function Login({ setAuth }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.post('/auth/login', { email, password });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      setAuth(true);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full -m-8 relative">
      {/* Left Side: UCE Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>

        <div className="z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">AnonyGate</h1>
          <p className="text-xl text-white/80 max-w-md leading-relaxed font-light">
            Ecosistema Distribuido de Recepción y Saneamiento de Denuncias Anónimas
          </p>
          <div className="mt-12 inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-medium tracking-wide">Plataforma Segura</span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 bg-[#F4F7FA] flex flex-col justify-center items-center p-8 lg:p-24 relative">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100 relative">
          <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-blue-600 transition-colors flex items-center text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Link>
          <div className="mb-10 mt-6 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Bienvenido de vuelta</h2>
            <p className="text-gray-500">Ingresa tus credenciales para acceder al backoffice.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium pl-12"
                  placeholder="analista@uce.edu.ec"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 pl-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-3 text-red-600 animate-fade-in">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center space-x-2 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-sm text-gray-400">
          Uso exclusivo para personal autorizado de la UCE.
        </p>
      </div>
    </div>
  );
}
