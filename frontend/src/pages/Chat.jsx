import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Chat({ onNavigate }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const adminUsuario = 'admin@miph.com';
  const propietarioUsuario = 'propietario@ejemplo.com';

  useEffect(() => {
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 5000);
    return () => clearInterval(interval);
  }, []);

  const cargarMensajes = async () => {
    try {
      const response = await axios.get(`https://miph-backend.onrender.com/api/mensajes/${adminUsuario}`);
      setMensajes(response.data);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    } finally {
      setCargando(false);
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    try {
      await axios.post('https://miph-backend.onrender.com/api/mensajes', {
        remitente: adminUsuario,
        destinatario: propietarioUsuario,
        mensaje: nuevoMensaje
      });
      setNuevoMensaje('');
      cargarMensajes();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar mensaje');
    }
  };

  if (cargando) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando mensajes...</div>;
  }

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
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

      <div style={{ background: 'linear-gradient(135deg, #1e3c32 0%, #2e7d32 100%)', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
        <h1>💬 Chat con Propietarios</h1>
        <p>Comunicación directa con los residentes</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '20px' }}>
        {mensajes.map((msg) => (
          <div key={msg.id} style={{
            textAlign: msg.remitente === adminUsuario ? 'right' : 'left',
            marginBottom: '15px'
          }}>
            <div style={{
              display: 'inline-block',
              background: msg.remitente === adminUsuario ? '#2e7d32' : '#1565c0',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '15px',
              maxWidth: '70%'
            }}>
              <strong>{msg.remitente === adminUsuario ? 'Administrador' : 'Propietario'}:</strong>
              <p style={{ margin: '5px 0 0 0' }}>{msg.mensaje}</p>
              <small style={{ opacity: 0.7 }}>{new Date(msg.fecha).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <textarea
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe tu respuesta..."
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', resize: 'none', height: '60px' }}
        />
        <button
          onClick={enviarMensaje}
          style={{ background: '#FFD700', color: '#1e3c32', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default Chat;