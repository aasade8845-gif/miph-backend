import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      const response = await axios.get('https://miph-backend.onrender.com/api/reportes');
      setReportes(response.data);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`https://miph-backend.onrender.com/api/reportes/${id}/estado`, {
        estado: nuevoEstado
      });
      // Recargar la lista
      cargarReportes();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const reportesFiltrados = reportes.filter(reporte => {
    if (filtro === 'todos') return true;
    return reporte.estado === filtro;
  });

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return '#ff9800';
      case 'en proceso': return '#2196f3';
      case 'resuelto': return '#4caf50';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Cargando reportes...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3c32 0%, #2e7d32 100%)', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px' }}>📋 Gestión de Reportes</h1>
        <p style={{ opacity: 0.8 }}>Administra los reportes enviados desde la app móvil</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFiltro('todos')}
          style={{
            padding: '8px 16px',
            background: filtro === 'todos' ? '#2e7d32' : '#f0f0f0',
            color: filtro === 'todos' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('pendiente')}
          style={{
            padding: '8px 16px',
            background: filtro === 'pendiente' ? '#ff9800' : '#f0f0f0',
            color: filtro === 'pendiente' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFiltro('en proceso')}
          style={{
            padding: '8px 16px',
            background: filtro === 'en proceso' ? '#2196f3' : '#f0f0f0',
            color: filtro === 'en proceso' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          En proceso
        </button>
        <button
          onClick={() => setFiltro('resuelto')}
          style={{
            padding: '8px 16px',
            background: filtro === 'resuelto' ? '#4caf50' : '#f0f0f0',
            color: filtro === 'resuelto' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Resueltos
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Ubicación</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Descripción</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Urgencia</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Estado</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reportesFiltrados.map((reporte) => (
              <tr key={reporte.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{reporte.id}</td>
                <td style={{ padding: '15px' }}>{reporte.tipo}</td>
                <td style={{ padding: '15px' }}>{reporte.ubicacion}</td>
                <td style={{ padding: '15px' }}>{reporte.descripcion}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    background: reporte.urgencia === 'emergencia' ? '#f44336' : 
                               reporte.urgencia === 'alta' ? '#ff9800' :
                               reporte.urgencia === 'normal' ? '#ffd700' : '#4caf50',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {reporte.urgencia}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <select
                    value={reporte.estado}
                    onChange={(e) => cambiarEstado(reporte.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${getEstadoColor(reporte.estado)}`,
                      background: getEstadoColor(reporte.estado) + '20',
                      color: getEstadoColor(reporte.estado),
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en proceso">En proceso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </td>
                <td style={{ padding: '15px' }}>{new Date(reporte.fecha).toLocaleString()}</td>
                <td style={{ padding: '15px' }}>
                  <button
                    onClick={() => window.open(`https://miph-backend.onrender.com/api/reportes/${reporte.id}`, '_blank')}
                    style={{
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportesFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '15px' }}>
          <p>No hay reportes {filtro !== 'todos' ? `con estado "${filtro}"` : ''}.</p>
        </div>
      )}
    </div>
  );
}

export default Reportes;