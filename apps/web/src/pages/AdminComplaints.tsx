import { useState, useEffect } from 'react';
import { adminApi, statusApi } from '../services/api';
import { AlertCircle, FileText, Search, RefreshCw, Eye, X, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

export default function AdminComplaints() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAdmin(payload.role?.toLowerCase() === 'admin');
      } catch {
        // invalid token
      }
    }
  }, []);

  const statusLabels: Record<string, string> = {
    'SUBMITTED': 'Recibido',
    'RECEIVED': 'Recibido',
    'IN_REVIEW': 'En Revisión',
    'AWAITING_INFO': 'Esperando Información',
    'CLOSED': 'Cerrado',
    'REJECTED': 'Rechazado',
  };

  const validTransitions: Record<string, string[]> = {
    'SUBMITTED': ['IN_REVIEW'],
    'RECEIVED': ['IN_REVIEW'],
    'IN_REVIEW': ['AWAITING_INFO', 'CLOSED', 'REJECTED'],
    'AWAITING_INFO': ['IN_REVIEW', 'CLOSED', 'REJECTED'],
    'CLOSED': [],
    'REJECTED': [],
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
      case 'CLOSED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/admin/complaints');
      // res.data contains { data: [...], meta: {...} } from the CQRS handler
      setComplaints(res.data.data || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('El endpoint /admin/complaints aún no está implementado en el backend ms-admin.');
      } else {
        setError(err.response?.data?.message || 'Error al cargar las denuncias.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();

    // Setup WebSockets for Real-Time Updates
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Forzar el uso del mismo origin (mismo puerto que el frontend, ej: 8080) para que pase por el Nginx correcto
    const baseUrl = import.meta.env.PROD ? window.location.origin : 'http://localhost:3006';
    const socket = io(baseUrl, {
      path: '/ws/status',
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('🔗 [WebSockets] Conectado a ms-status en tiempo real.');
    });

    socket.on('new_complaint', (payload) => {
      console.log('🔔 [WebSockets] Nueva denuncia recibida!', payload);
      // Actualizar tabla sin recargar página
      fetchComplaints();
    });

    socket.on('status_updated', (payload) => {
      console.log('🔄 [WebSockets] Estado actualizado!', payload);
      fetchComplaints();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredComplaints = complaints.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.aliasToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openModal = (complaint: any) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusUpdateError('');
    setStatusUpdateSuccess('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || newStatus === selectedComplaint.status) return;
    
    setStatusUpdating(true);
    setStatusUpdateError('');
    setStatusUpdateSuccess('');
    
    try {
      await statusApi.put(`/status/${selectedComplaint.id}`, { status: newStatus });
      setStatusUpdateSuccess('Estado actualizado con éxito en ms-status');
      // Update local state
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? { ...c, status: newStatus } : c));
      setTimeout(() => setSelectedComplaint(null), 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatusUpdateError(err.response?.data?.message || 'Error al actualizar el estado. Verifica que la transición de la máquina de estados sea válida.');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Denuncias</h2>
          <p className="text-gray-500">Revisa y administra los casos reportados anónimamente.</p>
        </div>
        <button onClick={fetchComplaints} className="btn-secondary flex items-center space-x-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="card-premium flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Alias Token o ID..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-0 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p>Cargando datos seguros...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Error de Carga</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No se encontraron denuncias para la búsqueda "{searchTerm}"</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-semibold whitespace-nowrap">ID</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Alias Token</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Estado</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Fecha de Creación</th>
                    <th className="p-4 font-semibold text-right whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">{c.id.slice(0, 8)}...</td>
                      <td className="p-4 font-mono font-medium text-slate-800 whitespace-nowrap">{c.aliasToken}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(c.status)}`}>
                          {statusLabels[c.status] || c.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => openModal(c)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing and changing status */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Detalles del Caso</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">ID y Alias</span>
                <div className="font-mono text-sm text-slate-700">{selectedComplaint.id}</div>
                <div className="font-mono font-bold text-blue-600">{selectedComplaint.aliasToken}</div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Actualizar Estado</span>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={isAdmin || validTransitions[selectedComplaint.status]?.length === 0}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={selectedComplaint.status}>{statusLabels[selectedComplaint.status] || selectedComplaint.status} (Actual)</option>
                  {(validTransitions[selectedComplaint.status] || []).map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status] || status}
                    </option>
                  ))}
                </select>
                {isAdmin ? (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    Como Administrador, solo tienes permisos de lectura. Solo los Oficiales de Cumplimiento (Analistas) pueden cambiar el estado.
                  </p>
                ) : validTransitions[selectedComplaint.status]?.length === 0 ? (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    Este es un estado terminal. El caso ya no puede ser modificado.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">
                    Solo se muestran las transiciones permitidas por la máquina de estados desde {statusLabels[selectedComplaint.status]}.
                  </p>
                )}
              </div>

              {statusUpdateError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{statusUpdateError}</span>
                </div>
              )}
              
              {statusUpdateSuccess && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{statusUpdateSuccess}</span>
                </div>
              )}

            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdateStatus}
                disabled={isAdmin || statusUpdating || newStatus === selectedComplaint.status}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center space-x-2"
              >
                {statusUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
