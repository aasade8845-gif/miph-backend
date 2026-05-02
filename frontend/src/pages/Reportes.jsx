import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Reportes({ onNavigate }) {
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
      cargarReportes();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const [mostrarProveedores, setMostrarProveedores] = useState(null);
const [proveedoresDisponibles, setProveedoresDisponibles] = useState([]);

const derivarAProveedor = async (reporteId, especialidad) => {
  try {
    const response = await axios.post('https://miph-backend-api.onrender.com/api/ordenes', {
      reporte_id: reporteId,
      especialidad: especialidad,
      presupuesto: 0
    });
    setProveedoresDisponibles(response.data.proveedores);
    setMostrarProveedores(reporteId);
  } catch (error) {
    alert('No hay proveedores disponibles para esta especialidad');
  }
};

const asignarProveedor = async (ordenId, proveedorId) => {
  try {
    await axios.put(`https://miph-backend-api.onrender.com/api/ordenes/${ordenId}/aceptar`, {
      proveedor_id: proveedorId
    });
    alert('Proveedor asignado correctamente');
    setMostrarProveedores(null);
    cargarReportes();
  } catch (error) {
    alert('Error al asignar proveedor');
    }
  };

  <td style={{ padding: '15px' }}>
  <button
    onClick={() => derivarAProveedor(reporte.id, 
      reporte.tipo === '💡 Eléctrico' ? 'electricista' :
      reporte.tipo === '🚰 Plomería' ? 'plomero' : 'limpieza'
    )}
    style={{ background: '#ff9800', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
  >
    🔧 Derivar a proveedor
  </button>
</td>

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return '#ff9800';
      case 'en proceso': return '#2196f3';
      case 'resuelto': return '#4caf50';
      default: return '#999';
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando reportes...</div>;
  }

  const reportesFiltrados = filtro === 'todos' ? reportes : reportes.filter(r => r.estado === filtro);

  return (
    <div style={{ padding: '20px' }}>
      {/* Botón Volver al Dashboard */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            background: '#FFD700',
            color: '#1e3c32',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e3c32 0%, #2e7d32 100%)', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px' }}>📋 Gestión de Reportes</h1>
        <p style={{ opacity: 0.8 }}>Administra los reportes enviados desde la app móvil</p>
      </div>

      {mostrarProveedores && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', maxWidth: '500px', width: '90%' }}>
      <h3>Seleccionar proveedor</h3>
      {proveedoresDisponibles.map(p => (
        <div key={p.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><strong>{p.nombre}</strong> - {p.especialidad}<br />📞 {p.telefono}</div>
          <button onClick={() => asignarProveedor(mostrarProveedores, p.id)} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Asignar</button>
        </div>
      ))}
      <button onClick={() => setMostrarProveedores(null)} style={{ marginTop: '15px', background: '#999', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
    </div>
  </div>
)}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setFiltro('todos')} style={{ padding: '8px 16px', background: filtro === 'todos' ? '#2e7d32' : '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Todos</button>
        <button onClick={() => setFiltro('pendiente')} style={{ padding: '8px 16px', background: filtro === 'pendiente' ? '#ff9800' : '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Pendientes</button>
        <button onClick={() => setFiltro('en proceso')} style={{ padding: '8px 16px', background: filtro === 'en proceso' ? '#2196f3' : '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>En proceso</button>
        <button onClick={() => setFiltro('resuelto')} style={{ padding: '8px 16px', background: filtro === 'resuelto' ? '#4caf50' : '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Resueltos</button>
      </div>

      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Tipo</th>
              <th style={{ padding: '15px' }}>Ubicación</th>
              <th style={{ padding: '15px' }}>Descripción</th>
              <th style={{ padding: '15px' }}>Urgencia</th>
              <th style={{ padding: '15px' }}>Estado</th>
              <th style={{ padding: '15px' }}>Fecha</th>
              <th style={{ padding: '15px' }}>Acciones</th>
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
                    onClick={() => alert(`Reporte de ${reporte.tipo} en ${reporte.ubicacion}`)}
                    style={{ background: '#2196f3', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}
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
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '15px', marginTop: '20px' }}>
          <p>No hay reportes {filtro !== 'todos' ? `con estado "${filtro}"` : ''}.</p>
        </div>
      )}
    </div>
  );
}

export default Reportes;