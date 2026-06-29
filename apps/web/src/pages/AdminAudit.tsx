import { useState, useEffect } from 'react';
import { auditApi, adminApi } from '../services/api';
import { ShieldCheck, History, Search, RefreshCw, Key, Database, Archive, User } from 'lucide-react';

interface AuditEvent {
  _id: string;
  eventId: string;
  eventType: string;
  payload: any;
  previousHash: string;
  hash: string;
  timestamp: string;
}

export default function AdminAudit() {
  const [activeTab, setActiveTab] = useState<'logs' | 'archives'>('logs');
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [archives, setArchives] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [analystsMap, setAnalystsMap] = useState<Record<string, string>>({});
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const fetchAuditData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'logs') {
        const response = await auditApi.get('/logs');
        setLogs(response.data);
      } else {
        const response = await auditApi.get('/archives');
        setArchives(response.data);
      }

      // Also fetch analysts to map UUID to Email
      try {
        const analystsRes = await adminApi.get('/admin/analysts');
        const map: Record<string, string> = {};
        analystsRes.data?.forEach((a: any) => {
          map[a.id] = a.email.split('@')[0]; // Just the username part
        });
        setAnalystsMap(map);
      } catch (e) {
        console.warn('Could not fetch analysts for audit mapping', e);
      }
      setLastSync(new Date());
    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError('Error al cargar la cadena de auditoría. Asegúrate de tener permisos de administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [activeTab]);

  const currentData = activeTab === 'logs' ? logs : archives;
  const filteredData = currentData.filter(
    (item) =>
      item.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.eventType && item.eventType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper map to associate complaint IDs with their aliases across all events
  const aliasMap = new Map<string, string>();
  [...logs, ...archives].forEach((item) => {
    const t = item.payload?.aliasToken || item.payload?.data?.aliasToken || item.payload?.complaint?.aliasToken;
    const cid = item.payload?.complaintId || item.payload?.data?.id || item.payload?.id;
    if (t && cid) {
      aliasMap.set(cid, t);
    }
  });

  const extractAlias = (payload: any) => {
    if (!payload) return null;
    
    // Attempt to find the aliasToken directly
    let token = payload.aliasToken || payload.data?.aliasToken || payload.complaint?.aliasToken;
    
    // If not found, try to look it up using the ID
    const complaintId = payload.complaintId || payload.data?.id || payload.id;
    if (!token && complaintId && aliasMap.has(complaintId)) {
      token = aliasMap.get(complaintId);
    }

    if (token) {
      // Hide part of the token for Zero-Trust visual (e.g., Adjetivo-Sustantivo-***)
      const parts = token.split('-');
      if (parts.length >= 3) {
        return `${parts[0]}-${parts[1]}-***`;
      }
      return '***';
    }

    // Fallback: If absolutely no alias could be resolved, show the ID
    if (complaintId) {
      return `ID: ${complaintId.split('-')[0]}`;
    }

    return null;
  };

  const getActionLabel = (eventType: string) => {
    if (!eventType) return 'Desconocido';
    switch (eventType.toLowerCase()) {
      case 'complaint.created': return 'Denuncia Creada';
      case 'ai.analysis.completed': return 'Análisis de IA';
      case 'sanitization.completed': return 'Saneamiento';
      case 'complaint.status.updated': return 'Cambio de Estado';
      default: return eventType;
    }
  };

  const getActionColor = (eventType: string) => {
    if (!eventType) return 'bg-slate-50 text-slate-700 border-slate-200';
    switch (eventType.toLowerCase()) {
      case 'complaint.created': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ai.analysis.completed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'sanitization.completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'complaint.status.updated': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getActionDetails = (item: AuditEvent) => {
    const p = item.payload;
    if (!p) return null;
    
    if (item.eventType === 'complaint.status.updated') {
      const translateStatus = (s: string) => {
        switch (s?.toUpperCase()) {
          case 'SUBMITTED': return 'Enviado';
          case 'RECEIVED': return 'Recibido';
          case 'IN_REVIEW': return 'En Revisión';
          case 'AWAITING_INFO': return 'Esperando Información';
          case 'WAITING_INFO': return 'Esperando Información';
          case 'CLOSED': return 'Cerrado';
          case 'REJECTED': return 'Rechazado';
          default: return s;
        }
      };
      
      const fromStatusStr = p.payload?.fromStatus || p.fromStatus;
      const toStatusStr = p.payload?.toStatus || p.toStatus || p.status;
      const analystIdStr = p.payload?.analystId || p.analystId;

      const from = translateStatus(fromStatusStr) || '?';
      const to = translateStatus(toStatusStr) || '?';
      
      return `${from} ➔ ${to}`;
    }
    
    if (item.eventType === 'ai.analysis.completed') {
      const urgency = p.urgencyLevel || p.analysis?.urgencyLevel || '?';
      return `Urgencia: ${urgency}`;
    }

    if (item.eventType === 'sanitization.completed') {
      return p.status === 'COMPLETED' ? 'Limpio' : 'Procesado';
    }

    return null;
  };

  const getResponsible = (item: AuditEvent) => {
    const p = item.payload;
    if (!p) return 'Sistema';
    
    const analystIdStr = p.payload?.analystId || p.analystId;
    if (analystIdStr) {
      const analystName = analystsMap[analystIdStr] || analystIdStr.split('-')[0];
      return `Analista: ${analystName}`;
    }

    if (item.eventType === 'complaint.created') return 'Sistema (Anónimo)';
    if (item.eventType === 'ai.analysis.completed') return 'Motor IA';
    if (item.eventType === 'sanitization.completed') return 'Go Worker';

    return 'Sistema';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Auditoría Forense Inmutable
          </h1>
          <p className="text-slate-500 mt-1">
            Registro criptográfico de solo lectura de todos los eventos del sistema.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Actualizado: {lastSync.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchAuditData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-indigo-50/50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4 h-4" />
            Eventos Activos (AuditLog)
          </button>
          <button
            onClick={() => setActiveTab('archives')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'archives'
                ? 'bg-indigo-50/50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Archive className="w-4 h-4" />
            Casos Cerrados (AuditArchive)
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ID de evento o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-8 text-center">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {/* Table Content */}
        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Evento & Contexto</th>
                  <th className="px-6 py-4 font-semibold">Responsable</th>
                  <th className="px-6 py-4 font-semibold">Firma Criptográfica</th>
                  <th className="px-6 py-4 font-semibold text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                      Sincronizando cadena de bloques...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      No hay registros de auditoría en esta colección.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionColor(item.eventType)}`}>
                              {getActionLabel(item.eventType)}
                            </span>
                            {extractAlias(item.payload) && (
                              <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                                {extractAlias(item.payload)}
                              </span>
                            )}
                          </div>
                          {getActionDetails(item) && (
                            <span className="text-sm font-medium text-slate-700 mt-1">
                              {getActionDetails(item)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {getResponsible(item)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 group/hash" title={`Hash: ${item.hash}`}>
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {item.hash.substring(0, 16)}...
                            </span>
                          </div>
                          <div className="flex items-center gap-2 opacity-60" title={`Prev: ${item.previousHash}`}>
                            <Key className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-[10px] text-slate-400">
                              Prev: {item.previousHash.substring(0, 12)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-slate-700">
                            {new Date(item.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(item.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
