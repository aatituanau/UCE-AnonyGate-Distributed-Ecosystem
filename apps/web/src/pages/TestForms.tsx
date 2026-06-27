import React, { useState } from 'react';

const TestForms: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Llama a la Query getAllForms
  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3004/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    }
    setLoading(false);
  };

  // Llama a la Mutation saveForm
  const createForm = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3004/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation SaveForm($categoryId: String!, $title: String!, $schemaDefinition: JSON!) {
              saveForm(categoryId: $categoryId, title: $title, schemaDefinition: $schemaDefinition) {
                id
                categoryId
                title
              }
            }
          `,
          variables: {
            categoryId: 'corruption',
            title: 'Denuncia de Corrupción',
            schemaDefinition: { fields: [{ name: 'amount', type: 'number' }] }
          }
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Test MS-03: Dynamic Forms (GraphQL)</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={fetchForms}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          {loading ? 'Cargando...' : 'Obtener Todos (Query)'}
        </button>
        <button 
          onClick={createForm}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
        >
          {loading ? 'Cargando...' : 'Crear/Upsert Form (Mutation)'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow-inner min-h-[300px] overflow-auto">
        <h2 className="text-lg font-semibold mb-2">Respuesta de GraphQL:</h2>
        <pre className="text-sm text-gray-700">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestForms;
