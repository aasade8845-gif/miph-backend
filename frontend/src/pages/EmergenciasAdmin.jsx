import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EmergenciasAdmin({ onNavigate }) {
  const [emergencias, setEmergencias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editValue, setEditValue] = useState({ nombre: '', telefono: '' });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEmergencias();
  }, []);

  const cargarEmergencias = async () => {
    try {
      const response = await axios.get('https://miph-backend-1.onrender.com/api/emergencias');
      setEmergencias(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const guardarCambio = async (id) => {
    try {
      await axios.put(`https://miph-backend-1.onrender.com/api/emergencias/${id}`, {
        nombre: editValue.nombre,
        telefono: editValue.telefono
      });
      setEditando(null);
      cargarEmergencias();
      alert('Contacto actualizado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar');
    }
  };

  if (cargando) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando contactos de emergencia...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => onNavigate('dashboard')}
          style={{ background: '#FFD700', color: '#1e3c32', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e3c32 0%, #2e7d32 100%)', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
        <h1>🚨 Contactos de Emergencia</h1>
        <p>Administra los números de emergencia que verán los propietarios en la app</p>
      </div>

      <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Servicio</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Teléfono</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {emergencias.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  {editando === item.id ? (
                    <input
                      value={editValue.nombre}
                      onChange={(e) => setEditValue({ ...editValue, nombre: e.target.value })}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                    />
                  ) : (
                    <strong>{item.nombre}</strong>
                  )}
                </td>
                <td style={{ padding: '15px' }}>
                  {editando === item.id ? (
                    <input
                      value={editValue.telefono}
                      onChange={(e) => setEditValue({ ...editValue, telefono: e.target.value })}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                    />
                  ) : (
                    <a href={`tel:${item.telefono}`} style={{ color: '#2196f3', textDecoration: 'none' }}>{item.telefono}</a>
                  )}
                </td>
                <td style={{ padding: '15px' }}>
                  {editando === item.id ? (
                    <>
                      <button onClick={() => guardarCambio(item.id)} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '8px', cursor: 'pointer' }}>Guardar</button>
                      <button onClick={() => setEditando(null)} style={{ background: '#999', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => { setEditando(item.id); setEditValue({ nombre: item.nombre, telefono: item.telefono }); }} style={{ background: '#ff9800', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>📌 Los números de emergencia se muestran en la app móvil de los propietarios.</p>
      </div>
    </div>
  );
}

export default EmergenciasAdmin;