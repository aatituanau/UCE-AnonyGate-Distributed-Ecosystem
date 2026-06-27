/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, List } from 'lucide-react';

export default function AdminForms() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Builder State
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<{name: string, label: string, type: string, optionsText: string}[]>([]);

  const fetchForms = async () => {
    setLoading(true);
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
      setForms(res.data.data.getAllForms || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const addField = () => {
    setFields([...fields, { name: '', label: '', type: 'text', optionsText: '' }]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...fields];
    (newFields[index] as any)[key] = value;
    setFields(newFields);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Parse fields before sending
      const parsedFields = fields.map(f => {
        const base = { name: f.name.toLowerCase().replace(/\s+/g, '_'), label: f.label, type: f.type };
        if (f.type === 'select' && f.optionsText) {
          return { ...base, options: f.optionsText.split(',').map(s => s.trim()).filter(Boolean) };
        }
        return base;
      });

      await axios.post(import.meta.env.VITE_API_FORMS_URL || 'http://localhost:3004/graphql', {
        query: `
          mutation SaveForm($categoryId: String!, $title: String!, $schemaDefinition: JSON!) {
            saveForm(categoryId: $categoryId, title: $title, schemaDefinition: $schemaDefinition) {
              id
            }
          }
        `,
        variables: {
          categoryId,
          title,
          schemaDefinition: { fields: parsedFields }
        }
      });
      
      // Reset and reload
      setCategoryId('');
      setTitle('');
      setFields([]);
      fetchForms();
      alert('Formulario guardado exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error guardando formulario.');
    }
    setSaving(false);
  };

  const handleDeleteForm = async (categoryId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este formulario por completo?')) return;
    try {
      await axios.post(import.meta.env.VITE_API_FORMS_URL || 'http://localhost:3004/graphql', {
        query: `
          mutation DeleteForm($categoryId: String!) {
            deleteForm(categoryId: $categoryId)
          }
        `,
        variables: { categoryId }
      });
      fetchForms();
    } catch (err) {
      console.error(err);
      alert('Error eliminando formulario.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestor de Formularios Dinámicos</h1>
          <p className="text-sm text-slate-500 mt-1">Crea y edita los campos que verán los usuarios al denunciar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BUILDER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Crear Nueva Categoría
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ID Categoría (interno)</label>
                <input 
                  required 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                  className="input-premium bg-slate-50" 
                  placeholder="ej: robo_equipos" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de la Categoría (Público)</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="input-premium bg-slate-50" 
                  placeholder="ej: Acoso Laboral" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-slate-700">Campos Dinámicos</label>
                <button type="button" onClick={addField} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-semibold">
                  + Agregar Campo
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                  No hay campos definidos. El usuario solo verá el título y descripción genéricos.
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, idx) => (
                    <div key={idx} className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl relative">
                      <button type="button" onClick={() => removeField(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                        <div>
                          <label className="text-xs font-bold text-slate-500">Nombre de la Variable</label>
                          <input required value={field.name} onChange={e => updateField(idx, 'name', e.target.value)} className="w-full text-sm p-2 border border-slate-200 rounded-lg" placeholder="ej: lugar_robo" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500">Etiqueta Pública</label>
                          <input required value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} className="w-full text-sm p-2 border border-slate-200 rounded-lg" placeholder="ej: ¿Dónde ocurrió?" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500">Tipo de Dato</label>
                        <select value={field.type} onChange={e => updateField(idx, 'type', e.target.value)} className="w-full text-sm p-2 border border-slate-200 rounded-lg bg-white">
                          <option value="text">Texto Libre</option>
                          <option value="number">Número</option>
                          <option value="select">Menú Desplegable (Opciones)</option>
                        </select>
                      </div>

                      {field.type === 'select' && (
                        <div className="mt-3">
                          <label className="text-xs font-bold text-slate-500">Opciones (separadas por coma)</label>
                          <input required value={field.optionsText} onChange={e => updateField(idx, 'optionsText', e.target.value)} className="w-full text-sm p-2 border border-slate-200 rounded-lg" placeholder="ej: Laboratorio, Aula, Biblioteca" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full justify-center space-x-2">
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Formulario'}</span>
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <List className="w-5 h-5 mr-2 text-blue-600" />
            Formularios Existentes
          </h2>

          {loading ? (
            <div className="text-center p-8 text-slate-400">Cargando...</div>
          ) : (
            <div className="space-y-4">
              {forms.map(form => (
                <div key={form.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800">{form.title}</h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase mt-1 inline-block">
                        {form.categoryId}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setCategoryId(form.categoryId);
                        setTitle(form.title);
                        setFields(form.schemaDefinition?.fields?.map((f: any) => ({
                          name: f.name,
                          label: f.label,
                          type: f.type,
                          optionsText: f.options?.join(', ') || ''
                        })) || []);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-semibold transition-colors"
                    >
                      Editar Formulario
                    </button>
                    <button 
                      onClick={() => handleDeleteForm(form.categoryId)}
                      className="ml-2 text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-semibold transition-colors"
                      title="Eliminar formulario por completo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-slate-600 mb-3">
                    <strong>Campos configurados:</strong> {form.schemaDefinition?.fields?.length || 0}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {form.schemaDefinition?.fields?.map((f: any, i: number) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                        {f.label || f.name} ({f.type})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {forms.length === 0 && <p className="text-sm text-slate-500">No hay formularios creados.</p>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
