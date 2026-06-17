import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { AlertCircle, Users, Search, RefreshCw, UserPlus, Shield, X, Check, Trash2 } from 'lucide-react';

export default function AdminAnalysts() {
  const [analysts, setAnalysts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for creating new analyst
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Search and delete states
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnalysts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.get('/admin/analysts');
      setAnalysts(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('El endpoint /admin/analysts aún no está implementado en el backend ms-admin.');
      } else {
        setError(err.response?.data?.message || 'Error al cargar analistas.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnalyst = async () => {
    if (!newEmail || !newPassword) return;
    setCreating(true);
    try {
      await adminApi.post('/admin/analysts', { email: newEmail, password: newPassword });
      setShowForm(false);
      setNewEmail('');
      setNewPassword('');
      fetchAnalysts(); // Recargar la lista
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear el analista');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAnalyst = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar a este analista? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try {
      await adminApi.delete(`/admin/analysts/${id}`);
      fetchAnalysts(); // Recargar la lista
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el analista');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchAnalysts();
  }, []);

  const filteredAnalysts = analysts.filter(a => 
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Directorio de Analistas</h2>
          <p className="text-gray-500">Gestiona al personal autorizado para revisar denuncias.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchAnalysts} className="btn-secondary flex items-center space-x-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Analista</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-6 bg-white border border-blue-100 rounded-2xl shadow-sm animate-fade-in relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-gray-900 mb-4">Registrar Nuevo Analista</h3>
          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico (UCE)</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="input-premium" placeholder="ejemplo@uce.edu.ec" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-premium" placeholder="••••••••" />
            </div>
            <button onClick={handleCreateAnalyst} disabled={creating || !newEmail || !newPassword} className="btn-primary flex items-center h-[50px]">
              {creating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
              {creating ? '' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="card-premium flex-1 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o correo..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-0 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <RefreshCw className="w-8 h-8 animate-spin mb-4" />
              <p>Cargando directorio seguro...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Error de Carga</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          ) : filteredAnalysts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No se encontraron analistas para la búsqueda "{searchTerm}"</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-semibold">Usuario / Correo</th>
                    <th className="p-4 font-semibold">Rol</th>
                    <th className="p-4 font-semibold">Fecha de Creación</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAnalysts.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {a.email.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{a.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100">
                          <Shield className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-bold text-blue-700 uppercase">{a.role}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteAnalyst(a.id)}
                          disabled={deletingId === a.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar Analista"
                        >
                          {deletingId === a.id ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
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
