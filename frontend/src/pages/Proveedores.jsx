import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Proveedores({ onNavigate }) {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre: '', email: '', telefono: '', especialidad: '' });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      const response = await axios.get('https://miph-backend-api.onrender.com/api/proveedores');
      setProveedores(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const registrarProveedor = async () => {
    try {
      await axios.post('https://miph-backend-api.onrender.com/api/proveedores', nuevoProveedor);
      setMostrarFormulario(false);
      setNuevoProveedor({ nombre: '', email: '', telefono: '', especialidad: '' });
      cargarProveedores();
      alert('Proveedor registrado');
    } catch (error) {
      alert('Error al registrar');
    }
  };

  if (cargando) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando proveedores...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => onNavigate('dashboard')} style={{ background: '#FFD700', color: '#1e3c32', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
        ← Volver al Dashboard
      </button>

      <div style={{ background: 'linear-gradient(135deg, #1e3c32 0%, #2e7d32 100%)', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
        <h1>🔧 Red de Proveedores</h1>
        <p>Gestiona los proveedores externos (plomeros, electricistas, etc.)</p>
      </div>

      <button onClick={() => setMostrarFormulario(true)} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
        + Registrar nuevo proveedor
      </button>

      {mostrarFormulario && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
          <h3>Registrar Proveedor</h3>
          <input type="text" placeholder="Nombre" value={nuevoProveedor.nombre} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="email" placeholder="Email" value={nuevoProveedor.email} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, email: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="tel" placeholder="Teléfono" value={nuevoProveedor.telefono} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, telefono: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <select value={nuevoProveedor.especialidad} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, especialidad: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
            <option value="">Seleccionar especialidad</option>
            <option value="plomero">Plomero</option>
            <option value="electricista">Electricista</option>
            <option value="limpieza">Limpieza</option>
            <option value="jardineria">Jardinería</option>
            <option value="pintor">Pintor</option>
            <option value="albañil">Albañil</option>
          </select>
          <button onClick={registrarProveedor} style={{ background: '#4caf50', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Guardar</button>
          <button onClick={() => setMostrarFormulario(false)} style={{ background: '#999', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginLeft: '10px' }}>Cancelar</button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '15px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9' }}>
            <tr><th style={{ padding: '15px' }}>Nombre</th><th style={{ padding: '15px' }}>Especialidad</th><th style={{ padding: '15px' }}>Teléfono</th><th style={{ padding: '15px' }}>Email</th><th style={{ padding: '15px' }}>Disponible</th></tr>
          </thead>
          <tbody>
            {proveedores.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{p.nombre}</td>
                <td style={{ padding: '15px' }}>{p.especialidad}</td>
                <td style={{ padding: '15px' }}>{p.telefono}</td>
                <td style={{ padding: '15px' }}>{p.email}</td>
                <td style={{ padding: '15px' }}>{p.disponible ? '✅ Sí' : '❌ No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Proveedores;