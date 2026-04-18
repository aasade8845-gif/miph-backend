import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ onLogout, onNavigate }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingPayments: 0,
    activeReservations: 0,
    pendingReports: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('https://miph-backend.onrender.com/api/stats');
        setStats({
          totalUsers: response.data.totalUsers,
          pendingPayments: response.data.pendingPayments,
          activeReservations: response.data.activeReservations,
          pendingReports: response.data.pendingReports
        });
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
     <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '10px' }}>
  <button
    onClick={() => onNavigate('reportes')}
    style={{
      background: '#2196f3',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer'
    }}
  >
    📋 Reportes
  </button>
  <button
    onClick={onLogout}
    style={{
      background: '#f44336',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer'
    }}
  >
    <button onClick={() => onNavigate('reservas')} style={{ background: '#ff9800', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
  📅 Reservas
</button>
    Cerrar sesión
  </button>
</div>

      <div style={{ background: 'linear-gradient(135deg, #1e3c32 0%, #2e7d32 100%)', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px' }}>Panel de Administración MiPH</h1>
        <p style={{ opacity: 0.8 }}>Bienvenido al sistema de gestión de tu comunidad</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>🏘️ Propietarios</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2e7d32' }}>{stats.totalUsers}</div>
          <div style={{ fontSize: '14px', color: '#999' }}>registrados</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>💰 Morosos</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff6b6b' }}>{stats.pendingPayments}</div>
          <div style={{ fontSize: '14px', color: '#999' }}>propietarios</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>📅 Reservas activas</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2e7d32' }}>{stats.activeReservations}</div>
          <div style={{ fontSize: '14px', color: '#999' }}>para hoy</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3 style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>🔧 Reportes pendientes</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800' }}>{stats.pendingReports}</div>
          <div style={{ fontSize: '14px', color: '#999' }}>sin atender</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', background: '#f9f9f9' }}>
          <strong>📋 Últimas actividades</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
          <div>Reporte de mantenimiento - Área de piscina</div>
          <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', background: '#fff3e0', color: '#ff9800' }}>Pendiente</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
          <div>Nueva reserva - Salón de eventos</div>
          <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', background: '#fff3e0', color: '#ff9800' }}>Pendiente</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
          <div>Pago recibido - Unidad 203</div>
          <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', background: '#e8f5e9', color: '#4caf50' }}>Completado</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px' }}>
          <div>Reporte de emergencia - Fuga de agua</div>
          <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', background: '#ffebee', color: '#f44336' }}>Urgente</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;