import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Reservas({ onNavigate }) {
  console.log('Reservas recibió onNavigate:', onNavigate);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      const response = await axios.get('https://miph-backend.onrender.com/api/reservas');
      setReservas(response.data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`https://miph-backend.onrender.com/api/reservas/${id}/estado`, {
        estado: nuevoEstado
      });
      cargarReservas();
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const crearReservaPrueba = async () => {
    try {
      const response = await axios.post('https://miph-backend.onrender.com/api/reservas', {
        fecha: '2025-04-20',
        hora: '3:00 PM',
        area: 'piscina',
        nombre: 'Prueba desde Panel',
        usuario: 'admin@miph.com'
      });
      console.log('Respuesta:', response.data);
      alert('✅ Reserva de prueba creada');
      cargarReservas();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear reserva');
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return '#ff9800';
      case 'aprobada': return '#4caf50';
      case 'rechazada': return '#f44336';
      default: return '#999';
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando reservas...</div>;
  }

  const reservasFiltradas = filtro === 'todos' 
    ? reservas 
    : reservas.filter(r => r.estado === filtro);

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
        <h1>📅 Gestión de Reservas</h1>
        <p>Administra las reservas de áreas sociales</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setFiltro('todos')} style={{ padding: '8px 16px', background: filtro === 'todos' ? '#2e7d32' : '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Todos</button>
        <button onClick={() => setFiltro('pendiente')} style={{ padding: '8px 16px', background: filtro === 'pendiente' ? '#ff9800' : '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Pendientes</button>
        <button onClick={() => setFiltro('aprobada')} style={{ padding: '8px 16px', background: filtro === 'aprobada' ? '#4caf50' : '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Aprobadas</button>
        <button onClick={() => setFiltro('rechazada')} style={{ padding: '8px 16px', background: filtro === 'rechazada' ? '#f44336' : '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Rechazadas</button>
      </div>

      <button
        onClick={crearReservaPrueba}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ➕ Crear Reserva de Prueba
      </button>

      <div style={{ background: 'white', borderRadius: '15px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Fecha</th>
              <th style={{ padding: '15px' }}>Hora</th>
              <th style={{ padding: '15px' }}>Área</th>
              <th style={{ padding: '15px' }}>Nombre</th>
              <th style={{ padding: '15px' }}>Estado</th>
              <th style={{ padding: '15px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservasFiltradas.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{r.id}</td>
                <td style={{ padding: '15px' }}>{new Date(r.fecha).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>{r.hora}</td>
                <td style={{ padding: '15px' }}>{r.area}</td>
                <td style={{ padding: '15px' }}>{r.nombre}</td>
                <td style={{ padding: '15px' }}>
                  <select 
                    value={r.estado} 
                    onChange={(e) => cambiarEstado(r.id, e.target.value)} 
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      border: `1px solid ${getEstadoColor(r.estado)}`, 
                      background: getEstadoColor(r.estado) + '20', 
                      color: getEstadoColor(r.estado) 
                    }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </td>
                <td style={{ padding: '15px' }}>
                  <button 
                    onClick={() => alert(`Reserva de ${r.nombre} para ${r.area} el ${new Date(r.fecha).toLocaleDateString()}`)} 
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

      {reservasFiltradas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '15px', marginTop: '20px' }}>
          <p>No hay reservas {filtro !== 'todos' ? `con estado "${filtro}"` : ''}.</p>
        </div>
      )}
    </div>
  );
}

export default Reservas;