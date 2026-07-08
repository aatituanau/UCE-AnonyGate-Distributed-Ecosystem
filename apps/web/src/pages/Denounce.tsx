/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, FileText, Key, Copy, CheckCircle2, AlertCircle, Clock, UploadCloud } from 'lucide-react';

export default function Denounce() {
  const statusLabels: Record<string, string> = {
    'SUBMITTED': 'Recibido',
    'RECEIVED': 'Recibido',
    'IN_REVIEW': 'En Revisión',
    'AWAITING_INFO': 'Esperando Información',
    'CLOSED': 'Cerrado',
    'REJECTED': 'Rechazado',
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
      case 'RECEIVED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'IN_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'AWAITING_INFO':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const [dynamicData, setDynamicData] = useState<Record<string, any>>({});
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultAlias, setResultAlias] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  // Llama a MS-03 cuando la pantalla carga para traer los esquemas disponibles
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.post(import.meta.env.VITE_API_FORMS_URL || 'http://localhost:3004/graphql', {
          query: `
            query {
              getAllForms {
                id
                categoryId
                title
                schemaDefinition
              }
            }
          `
        });
        setAvailableForms(res.data.data.getAllForms || []);
      } catch (err) {
        console.error("Error fetching forms from MS-03", err);
      }
    };
    fetchForms();
  }, []);

  const currentForm = availableForms.find(f => f.categoryId === selectedCategoryId);

  interface TrackingStatus {
    alias: string;
    status: string;
    urgency: string;
    faculty: string;
    submittedAt: string | number | Date;
    history: {
      id: string;
      fromStatus: string;
      toStatus: string;
      changedBy: string;
      changedAt: string;
    }[];
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
      const aliasRes = await axios.post(`${API_ALIAS}/aliases/generate`, { payload: dynamicData });
      const secretAlias = aliasRes.data.alias;

      // 2. Submit Full Payload to MS-04 (Submission Service)
      const API_SUBMISSION = import.meta.env.VITE_API_SUBMISSION_URL || 'http://localhost:3003';
      const submitRes = await axios.post(`${API_SUBMISSION}/api/v1/complaints`, {
        aliasToken: secretAlias,
        payload: { categoryId: selectedCategoryId, ...dynamicData }
      });
      const complaintId = submitRes.data.id;

      // 3. Submit Multiple Evidences if selected
      if (evidenceFiles.length > 0 && complaintId) {
        const API_EVIDENCE = import.meta.env.VITE_API_EVIDENCE_URL || 'http://localhost:3008';
        
        await Promise.all(evidenceFiles.map(async (file) => {
          const formUpload = new FormData();
          formUpload.append('complaintId', complaintId);
          formUpload.append('file', file);

          return axios.post(`${API_EVIDENCE}/evidence/upload`, formUpload, {
            headers: {
              'x-alias-token': secretAlias,
              'Content-Type': 'multipart/form-data',
            },
          });
        }));
      }

      setResultAlias(secretAlias);
      setDynamicData({});
      setEvidenceFiles([]);
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
      // Step 1: Get Complaint ID and details from Submission Service
      const API_SUBMISSION = import.meta.env.VITE_API_SUBMISSION_URL || 'http://localhost:3003';
      const submissionRes = await axios.get(`${API_SUBMISSION}/api/v1/complaints/${trackingAlias}`);
      const complaintData = submissionRes.data;
      const complaintId = complaintData.id;

      // Step 2: Get live Status and History from Status Service
      const API_STATUS = import.meta.env.VITE_API_STATUS_URL || 'http://localhost:3006';
      const statusRes = await axios.get(`${API_STATUS}/status/${complaintId}`, {
        headers: {
          'x-alias-token': trackingAlias
        }
      });
      const liveStatus = statusRes.data;

      setTrackingStatus({
        alias: trackingAlias,
        status: liveStatus.status,
        urgency: liveStatus.urgency,
        faculty: complaintData.payload?.facultad || complaintData.payload?.Facultad || complaintData.payload?.['Facultad involucrada'] || 'No especificada',
        submittedAt: complaintData.createdAt,
        history: liveStatus.history || []
      });

    } catch (err: unknown) {
      console.error(err);
      setTrackingError('No se encontró información para este Alias o hubo un error de conexión.');
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
              {/* --- INTEGRACIÓN DE FORMULARIOS DINÁMICOS --- */}
              {availableForms.length > 0 && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl mb-6 shadow-sm">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    ¿Qué tipo de irregularidad deseas denunciar?
                  </label>
                  <select
                    required
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      setDynamicData({}); // Clear data when category changes
                    }}
                    className="input-premium w-full bg-white"
                  >
                    <option value="" disabled>Selecciona una categoría...</option>
                    {availableForms.map((form: any) => (
                      <option key={form.id} value={form.categoryId}>{form.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* RENDERIZADO DINÁMICO DE CAMPOS (Basado en el esquema seleccionado) */}
              {currentForm && currentForm.schemaDefinition?.fields?.map((field: any) => (
                <div key={field.name} className="animate-fade-in mb-5">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {field.label || field.name}
                  </label>
                  
                  {field.type === 'select' && field.options ? (
                    <div className="space-y-3">
                      <select
                        required
                        value={dynamicData[field.name] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDynamicData(prev => ({ 
                            ...prev, 
                            [field.name]: val,
                            // Clear 'other' field if they stop selecting 'Otro valor'
                            [`${field.name}_other`]: val === 'Otro valor' ? prev[`${field.name}_other`] : undefined
                          }));
                        }}
                        className="input-premium w-full bg-white"
                      >
                        <option value="" disabled>Seleccione una opción...</option>
                        {field.options.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      
                      {/* Lógica para "Otro valor" */}
                      {dynamicData[field.name] === 'Otro valor' && (
                        <input
                          type="text"
                          required
                          value={dynamicData[`${field.name}_other`] || ''}
                          onChange={(e) => setDynamicData({ ...dynamicData, [`${field.name}_other`]: e.target.value })}
                          className="input-premium w-full animate-fade-in"
                          placeholder="Por favor, especifique el valor..."
                        />
                      )}
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required
                      rows={4}
                      value={dynamicData[field.name] || ''}
                      onChange={(e) => setDynamicData({ ...dynamicData, [field.name]: e.target.value })}
                      className="input-premium resize-none"
                      placeholder={`Ej: ${field.label || field.name}`}
                    ></textarea>
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      required
                      value={dynamicData[field.name] || ''}
                      onChange={(e) => setDynamicData({ ...dynamicData, [field.name]: e.target.value })}
                      className="input-premium"
                      placeholder={`Ej: ${field.label || field.name}`}
                    />
                  )}
                </div>
              ))}
              {/* --- FIN INTEGRACIÓN FORMULARIOS DINÁMICOS --- */}

              {/* MUESTRA ESTOS CAMPOS SOLO SI YA SELECCIONÓ LA CATEGORÍA */}
              {selectedCategoryId && (
                <div className="space-y-6 animate-fade-in">

                  {/* UPLOAD EVIDENCE SECTION */}
                  <div className="p-5 border border-dashed border-slate-300 bg-slate-50/50 rounded-xl">
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2">
                      <UploadCloud className="w-5 h-5 text-slate-500" />
                      <span>Adjuntar Evidencias (Opcional)</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-3">Puedes seleccionar múltiples archivos (Imágenes, PDF, etc. Máx 10MB por archivo).</p>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || []);
                        setEvidenceFiles(prev => [...prev, ...newFiles]);
                        // Limpiar el valor del input para permitir seleccionar el mismo archivo de nuevo si se borró
                        e.target.value = '';
                      }}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100 cursor-pointer"
                    />
                    
                    {evidenceFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Archivos seleccionados ({evidenceFiles.length}):</span>
                        <ul className="space-y-1">
                          {evidenceFiles.map((file, i) => (
                            <li key={i} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-sm">
                              <span className="truncate text-slate-700">{file.name}</span>
                              <button 
                                type="button" 
                                onClick={() => setEvidenceFiles(prev => prev.filter((_, idx) => idx !== i))}
                                className="text-red-500 hover:text-red-700 font-bold ml-2 shrink-0 px-2"
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}</div>

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
                </div>
              )}
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
                <div className={`px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider shadow-sm ${getStatusColor(trackingStatus.status)}`}>
                  {statusLabels[trackingStatus.status] || trackingStatus.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Facultad</span>
                  <span className="text-sm font-semibold text-slate-700">{trackingStatus.faculty}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Fecha de envío</span>
                  <span className="text-sm font-semibold text-slate-700">{new Date(trackingStatus.submittedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Urgencia AI</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-md ${trackingStatus.urgency === 'CRITICAL' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                    {trackingStatus.urgency}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              {trackingStatus.history && trackingStatus.history.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Línea de Tiempo del Caso</span>
                  </h4>
                  <div className="relative border-l-2 border-blue-100 ml-3 space-y-6">
                    {trackingStatus.history.map((h, i) => (
                      <div key={h.id} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-50"></div>
                        <div className="text-xs font-bold text-blue-500 mb-1">
                          {new Date(h.changedAt).toLocaleString()}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">
                          {i === 0
                            ? `Caso recibido (${statusLabels[h.toStatus] || h.toStatus})`
                            : `Cambio de estado: ${statusLabels[h.fromStatus] || h.fromStatus} → ${statusLabels[h.toStatus] || h.toStatus}`}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Por: {h.changedBy === 'SYSTEM' ? 'Sistema Automático' : 'Analista'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
