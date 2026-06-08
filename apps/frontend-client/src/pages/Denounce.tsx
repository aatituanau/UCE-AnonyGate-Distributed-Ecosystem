import { useState } from 'react';
import axios from 'axios';
import { Send, FileText, Building, Key, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Denounce() {
  const [formData, setFormData] = useState({ title: '', description: '', faculty: '' });
  const [loading, setLoading] = useState(false);
  const [resultAlias, setResultAlias] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Status tracking state
  const [trackingAlias, setTrackingAlias] = useState('');
  const [trackingStatus, setTrackingStatus] = useState<any>(null);
  const [trackingError, setTrackingError] = useState('');

  const handleDenounce = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_ALIAS = import.meta.env.VITE_API_ALIAS_URL || 'http://localhost:3001';
      const res = await axios.post(`${API_ALIAS}/aliases/generate`, formData);
      setResultAlias(res.data.alias);
      setFormData({ title: '', description: '', faculty: '' }); // reset form
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error connecting to ms-alias');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError('');
    setTrackingStatus(null);

    try {
      const API_ALIAS = import.meta.env.VITE_API_ALIAS_URL || 'http://localhost:3001';
      const res = await axios.get(`${API_ALIAS}/aliases/${trackingAlias}/status`);
      setTrackingStatus(res.data);
    } catch (err: any) {
      setTrackingError(err.response?.data?.message || 'Alias not found');
    }
  };

  const copyToClipboard = () => {
    if (resultAlias) {
      navigator.clipboard.writeText(resultAlias);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">

      {/* LEFT COLUMN: Submit Form */}
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold flex items-center space-x-3 mb-2">
              <FileText className="text-primary" />
              <span>Realizar Denuncia Anónima</span>
            </h2>
            <p className="text-white/50 text-sm">Tu identidad está 100% protegida. Registraremos la irregularidad sin guardar tus datos personales.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start space-x-3 text-danger">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {resultAlias ? (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center animate-fade-in relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>

              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Denuncia Registrada</h3>
              <p className="text-white/70 text-sm mb-6">Guarda este código ALIAS. Es la única forma de darle seguimiento a tu denuncia. Si lo pierdes, no hay forma de recuperarlo.</p>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between group">
                <span className="font-mono text-xl text-primary font-bold tracking-wider">{resultAlias}</span>
                <button onClick={copyToClipboard} className="text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-lg hover:bg-white/10">
                  {copied ? <CheckCircle2 className="w-5 h-5 text-secondary" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <button onClick={() => setResultAlias(null)} className="mt-6 text-sm text-white/50 hover:text-white underline">
                Hacer otra denuncia
              </button>
            </div>
          ) : (
            <form onSubmit={handleDenounce} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 pl-1">Título de la denuncia</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-premium"
                  placeholder="Ej: Irregularidad en notas de matemáticas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 pl-1">Facultad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="input-premium pl-11"
                    placeholder="Ej: Facultad de Ingeniería"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 pl-1">Descripción detallada</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-premium resize-none"
                  placeholder="Describe los hechos con la mayor cantidad de detalles posibles..."
                ></textarea>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Enviar Denuncia Anónima</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Track Alias */}
      <div className="flex flex-col space-y-6">
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center space-x-2 mb-2">
              <Key className="text-accent" />
              <span>Rastrear mi denuncia</span>
            </h2>
            <p className="text-white/50 text-sm">Ingresa tu código Alias para ver el estado actual del caso.</p>
          </div>

          <form onSubmit={handleTrack} className="flex space-x-3 mb-6">
            <input
              type="text"
              required
              value={trackingAlias}
              onChange={(e) => setTrackingAlias(e.target.value)}
              className="input-premium flex-1"
              placeholder="Ej: Silent-Eagle-404"
            />
            <button type="submit" className="btn-secondary whitespace-nowrap">
              Buscar
            </button>
          </form>

          {trackingError && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
              {trackingError}
            </div>
          )}

          {trackingStatus && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-fade-in">
              <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-white/50 uppercase block mb-1">Alias</span>
                  <span className="font-mono text-lg text-primary">{trackingStatus.alias}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs font-bold tracking-wider">
                  {trackingStatus.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-white/50 block mb-1">Facultad</span>
                  <span className="text-sm font-medium">{trackingStatus.faculty}</span>
                </div>
                <div>
                  <span className="text-xs text-white/50 block mb-1">Fecha de envío</span>
                  <span className="text-sm font-medium">{new Date(trackingStatus.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>


      </div>

    </div>
  );
}
