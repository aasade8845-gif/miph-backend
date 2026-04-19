import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Reportes from './pages/Reportes';
import Reservas from './pages/Reservas';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('token') !== null;
  });
  const [paginaActual, setPaginaActual] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsAuthenticated(false);
    setPaginaActual('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (paginaActual === 'reportes') {
    return <Reportes />;
  }

  if (paginaActual === 'reservas') {
    return <Reservas />;
  }

  return <Dashboard onLogout={handleLogout} onNavigate={setPaginaActual} />;
}

export default App;