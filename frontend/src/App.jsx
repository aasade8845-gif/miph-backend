import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Reportes from './pages/Reportes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('token') !== null;
  });
  const [paginaActual, setPaginaActual] = useState('dashboard');

  const handleLogin = (usuario) => {
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

  return <Dashboard onLogout={handleLogout} onNavigate={setPaginaActual} />;
}

export default App;