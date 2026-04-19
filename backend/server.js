const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { connectDB, getPropietarios, getMorosos, pool } = require('./models/Database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'mi_secreto_super_seguro';

const USUARIO_ADMIN = {
  email: 'admin@miph.com',
  password: 'admin123',
  nombre: 'Administrador',
  rol: 'admin'
};

// Conectar a Supabase al iniciar
connectDB();

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === USUARIO_ADMIN.email && password === USUARIO_ADMIN.password) {
    const token = jwt.sign(
      { email: USUARIO_ADMIN.email, rol: USUARIO_ADMIN.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      usuario: {
        email: USUARIO_ADMIN.email,
        nombre: USUARIO_ADMIN.nombre,
        rol: USUARIO_ADMIN.rol
      }
    });
  } else {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
});

// Ruta de estadísticas (desde Supabase)
app.get('/api/stats', async (req, res) => {
  try {
    const totalUsers = await getPropietarios();
    const morosos = await getMorosos();
    
    res.json({
      totalUsers: totalUsers.length,
      pendingPayments: morosos.length,
      activeReservations: 8,
      pendingReports: 5
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Ruta para recibir reportes desde la app móvil
app.post('/api/reportes', async (req, res) => {
  try {
    const { tipo, ubicacion, descripcion, urgencia, usuario } = req.body;
    
    console.log('📱 Nuevo reporte desde app:', { tipo, ubicacion, descripcion, urgencia, usuario });
    
    // Verificar que pool está definido
    if (!pool) {
      console.error('❌ Pool no está definido');
      return res.status(500).json({ error: 'Pool no está definido' });
    }
    
    // Guardar en Supabase
    app.post('/api/reservas', async (req, res) => {
  try {
    const { fecha, hora, area, nombre, usuario } = req.body;
    
    console.log('📅 Nueva reserva recibida:', { fecha, hora, area, nombre, usuario });
    
    const result = await pool.query(
      `INSERT INTO reservas (fecha, hora, area, nombre, usuario, estado) 
       VALUES ($1, $2, $3, $4, $5, 'pendiente') 
       RETURNING *`,
      [fecha, hora, area, nombre, usuario]
    );
    
    console.log('✅ Reserva guardada en BD:', result.rows[0]);
    res.json({ mensaje: 'Reserva guardada', reserva: result.rows[0], ok: true });
    
  } catch (error) {
    console.error('❌ Error en POST /api/reservas:', error.message);
    res.status(500).json({ error: error.message });
  }
});
    
    console.log('✅ Reporte guardado en BD:', result.rows[0]);
    res.json({ mensaje: 'Reporte guardado', reporte: result.rows[0], ok: true });
    
  } catch (error) {
    console.error('❌ Error en /api/reportes:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para recibir mensajes del chat desde app móvil
app.post('/api/mensajes', async (req, res) => {
  try {
    const { mensaje, usuario } = req.body;
    console.log('💬 Nuevo mensaje desde app:', { mensaje, usuario });
    res.json({ mensaje: 'Mensaje recibido', ok: true });
  } catch (error) {
    console.error('Error en /api/mensajes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para recibir reservas desde app móvil
app.post('/api/reservas', async (req, res) => {
  try {
    const { fecha, hora, area, nombre } = req.body;
    console.log('📅 Nueva reserva desde app:', { fecha, hora, area, nombre });
    res.json({ mensaje: 'Reserva recibida', ok: true });
  } catch (error) {
    console.error('Error en /api/reservas:', error);
    res.status(500).json({ error: error.message });
    // Ruta para recibir reservas desde app móvil
app.post('/api/reservas', async (req, res) => {
  try {
    const { fecha, hora, area, nombre, usuario } = req.body;
    
    console.log('📅 Nueva reserva desde app:', { fecha, hora, area, nombre, usuario });
    
    const result = await pool.query(
      `INSERT INTO reservas (fecha, hora, area, nombre, usuario, estado) 
       VALUES ($1, $2, $3, $4, $5, 'pendiente') 
       RETURNING *`,
      [fecha, hora, area, nombre, usuario]
    );
    
    console.log('✅ Reserva guardada en BD:', result.rows[0]);
    res.json({ mensaje: 'Reserva guardada', reserva: result.rows[0], ok: true });
    
  } catch (error) {
    console.error('❌ Error en /api/reservas:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener todas las reservas (para el panel web)
app.get('/api/reservas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservas ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error en GET /api/reservas:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para actualizar estado de una reserva
app.put('/api/reservas/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const result = await pool.query(
      'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    
    res.json({ mensaje: 'Estado actualizado', reserva: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: error.message });
  }
});
// Ruta para obtener todos los reportes (para el panel web)
app.get('/api/reportes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reportes ORDER BY fecha DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error en GET /api/reportes:', error);
    res.status(500).json({ error: error.message });
  }
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔐 Login: admin@miph.com / admin123`);
});"// Redeploy" 
