import { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import { ShieldCheck, History, Search, RefreshCw, Key, Database, Archive } from 'lucide-react';

interface AuditEvent {
  _id: string;
  eventId: string;
  topic: string;
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
      item.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <button
          onClick={fetchAuditData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
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
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Evento / ID</th>
                  <th className="px-6 py-4">Tópico (Acción)</th>
                  <th className="px-6 py-4">Integridad Criptográfica</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                      Sincronizando cadena de bloques...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      No hay registros de auditoría en esta colección.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs">
                        <span className="text-slate-900 font-medium">{item.eventId.split('-')[0]}...</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.topic}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Key className="w-3 h-3 text-slate-400" />
                            <span className="font-mono text-[10px] text-slate-400 truncate w-48 block" title={item.previousHash}>
                              Prev: {item.previousHash}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span className="font-mono text-[10px] text-emerald-600 font-medium truncate w-48 block" title={item.hash}>
                              Hash: {item.hash}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(item.timestamp).toLocaleString()}
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
