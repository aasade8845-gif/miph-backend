import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Reportes from './pages/Reportes';
import Reservas from './pages/Reservas';
import Chat from './pages/Chat';
import EmergenciasAdmin from './pages/EmergenciasAdmin';
import VisitasAdmin from './pages/VisitasAdmin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paginaActual, setPaginaActual] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPaginaActual('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (paginaActual === 'emergencias-admin') {
  return <EmergenciasAdmin onNavigate={setPaginaActual} />;
  }

  if (paginaActual === 'reportes') {
    return <Reportes onNavigate={setPaginaActual} />;
  }

  if (paginaActual === 'reservas') {
    return <Reservas onNavigate={setPaginaActual} />;
  }

  if (paginaActual === 'chat') {
    return <Chat onNavigate={setPaginaActual} />;
  }

  if (paginaActual === 'visitas-admin') {
  return <VisitasAdmin onNavigate={setPaginaActual} />;
}

  return <Dashboard onLogout={handleLogout} onNavigate={setPaginaActual} />;
}

export default App;