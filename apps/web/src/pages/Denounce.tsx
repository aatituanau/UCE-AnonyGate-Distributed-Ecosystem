import { useState } from 'react';
import axios from 'axios';
import { Send, FileText, Building, Key, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Denounce() {
  const [formData, setFormData] = useState({ title: '', description: '', faculty: '' });
  const [loading, setLoading] = useState(false);
  const [resultAlias, setResultAlias] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  interface TrackingStatus {
    alias: string;
    status: string;
    faculty: string;
    submittedAt: string | number | Date;
  }

  // Status tracking state
  const [trackingAlias, setTrackingAlias] = useState('');
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus | null>(null);
  const [trackingError, setTrackingError] = useState('');

  const handleDenounce = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Get Secret Alias from MS-02 (Alias Service)
      const API_ALIAS = import.meta.env.VITE_API_ALIAS_URL || 'http://localhost:3001';
      const aliasRes = await axios.post(`${API_ALIAS}/aliases/generate`, formData);
      const secretAlias = aliasRes.data.alias;

      // 2. Submit Full Payload to MS-04 (Submission Service)
      const API_SUBMISSION = import.meta.env.VITE_API_SUBMISSION_URL || 'http://localhost:3003';
      await axios.post(`${API_SUBMISSION}/api/v1/complaints`, {
        aliasToken: secretAlias,
        payload: formData
      });

      setResultAlias(secretAlias);
      setFormData({ title: '', description: '', faculty: '' }); // reset form
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Error processing your complaint. Please try again.');
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
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setTrackingError(e.response?.data?.message || 'Alias no encontrado');
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
    <div className="animate-fade-in w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* LEFT COLUMN: Submit Form */}
      <div className="card-premium p-8 relative overflow-hidden flex flex-col">
        <div className="relative z-10 flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-bold flex items-center space-x-3 mb-2 text-slate-800">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="text-blue-600 w-6 h-6" />
              </div>
              <span>Realizar Denuncia Anónima</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">Tu identidad está 100% protegida criptográficamente. Registraremos la irregularidad sin guardar tu IP, navegador ni datos personales.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {resultAlias ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center animate-fade-in relative overflow-hidden flex-1 flex flex-col justify-center">
              <CheckCircle2 className="w-20 h-20 text-blue-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Denuncia Registrada!</h3>
              <p className="text-slate-600 text-sm mb-8 leading-relaxed">Guarda este código ALIAS. Es tu <strong>única forma</strong> de darle seguimiento al caso en el futuro. Si lo pierdes, no hay forma técnica de recuperarlo.</p>

              <div className="bg-white border border-blue-200 shadow-sm rounded-xl p-5 flex items-center justify-between mb-8">
                <span className="font-mono text-xl text-blue-700 font-bold tracking-wider select-all">{resultAlias}</span>
                <button onClick={copyToClipboard} className="text-slate-400 hover:text-blue-600 transition-colors p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 shadow-sm">
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <button onClick={() => setResultAlias(null)} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                ← Hacer otra denuncia
              </button>
            </div>
          ) : (
            <form onSubmit={handleDenounce} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Título de la denuncia</label>
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Facultad involucrada</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Descripción detallada de los hechos</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-premium resize-none"
                  placeholder="Describe los hechos con la mayor cantidad de detalles posibles..."
                ></textarea>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full h-[52px] flex items-center justify-center space-x-2 text-base">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Enviar Denuncia de Forma Segura</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Track Alias */}
      <div className="flex flex-col space-y-6">
        <div className="card-premium p-8 relative overflow-hidden">
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center space-x-3 mb-2 text-slate-800">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Key className="text-slate-600 w-5 h-5" />
              </div>
              <span>Rastrear mi denuncia</span>
            </h2>
            <p className="text-slate-500 text-sm">Ingresa tu código Alias para ver el estado actual del caso sin revelar quién eres.</p>
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
            <button type="submit" className="btn-secondary whitespace-nowrap border-slate-300">
              Consultar
            </button>
          </form>

          {trackingError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium animate-fade-in">
              {trackingError}
            </div>
          )}

          {trackingStatus && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 animate-fade-in">
              <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-5">
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase block mb-1">Identidad Segura</span>
                  <span className="font-mono text-xl text-blue-600 font-bold">{trackingStatus.alias}</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold tracking-wider shadow-sm">
                  {trackingStatus.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Facultad</span>
                  <span className="text-sm font-semibold text-slate-700">{trackingStatus.faculty}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Fecha de envío</span>
                  <span className="text-sm font-semibold text-slate-700">{new Date(trackingStatus.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
