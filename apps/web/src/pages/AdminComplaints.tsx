import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { AlertCircle, FileText, Search, RefreshCw, Eye } from 'lucide-react';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/admin/complaints');
      // res.data contains { data: [...], meta: {...} } from the CQRS handler
      setComplaints(res.data.data || []);
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
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.aliasToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Alias Token</th>
                    <th className="p-4 font-semibold">Estado</th>
                    <th className="p-4 font-semibold">Fecha de Creación</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-500">{c.id.slice(0, 8)}...</td>
                      <td className="p-4 font-mono font-medium text-slate-800">{c.aliasToken}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
    </div>
  );
}
