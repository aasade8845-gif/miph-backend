import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VisitasAdmin({ onNavigate }) {
  const [visitas, setVisitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarVisitas();
  }, []);

  const cargarVisitas = async () => {
    try {
      const response = await axios.get('https://miph-backend-api.onrender.com/api/visitas');
      setVisitas(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando historial de visitas...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => onNavigate('dashboard')} style={{ background: '#FFD700', color: '#1e3c32', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
        ← Volver al Dashboard
      </button>

      <div style={{ background: 'linear-gradient(135deg, #1e3c32 0%, #2e7d32 100%)', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
        <h1>📋 Historial de Visitas</h1>
        <p>Registro de todas las visitas registradas en el PH</p>
      </div>

      <div style={{ background: 'white', borderRadius: '15px', overflow: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>
              <th style={{ padding: '15px' }}>Unidad</th>
              <th style={{ padding: '15px' }}>Visitante</th>
              <th style={{ padding: '15px' }}>Fecha</th>
              <th style={{ padding: '15px' }}>Hora</th>
              <th style={{ padding: '15px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {visitas.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{v.unidad}</td>
                <td style={{ padding: '15px' }}>{v.nombre_visitante}</td>
                <td style={{ padding: '15px' }}>{new Date(v.fecha).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>{v.hora_entrada || '—'}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: v.estado === 'activo' ? '#ff9800' : '#4caf50',
                    color: 'white'
                  }}>
                    {v.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VisitasAdmin;