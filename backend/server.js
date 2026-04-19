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

// Conectar a la base de datos
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

// Estadísticas
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

// Reportes
app.post('/api/reportes', async (req, res) => {
  try {
    const { tipo, ubicacion, descripcion, urgencia, usuario } = req.body;
    console.log('📱 Nuevo reporte:', { tipo, ubicacion, descripcion, urgencia, usuario });
    
    const result = await pool.query(
      `INSERT INTO reportes (tipo, ubicacion, descripcion, urgencia, usuario, estado, fecha) 
       VALUES ($1, $2, $3, $4, $5, 'pendiente', NOW()) 
       RETURNING *`,
      [tipo, ubicacion, descripcion, urgencia, usuario]
    );
    
    console.log('✅ Reporte guardado:', result.rows[0]);
    res.json({ mensaje: 'Reporte guardado', reporte: result.rows[0], ok: true });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reportes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reportes ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reportes/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const result = await pool.query('UPDATE reportes SET estado = $1 WHERE id = $2 RETURNING *', [estado, id]);
    res.json({ mensaje: 'Estado actualizado', reporte: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reservas
app.post('/api/reservas', async (req, res) => {
  try {
    const { fecha, hora, area, nombre, usuario } = req.body;
    console.log('📅 Nueva reserva:', { fecha, hora, area, nombre, usuario });
    
    const result = await pool.query(
      `INSERT INTO reservas (fecha, hora, area, nombre, usuario, estado) 
       VALUES ($1, $2, $3, $4, $5, 'pendiente') 
       RETURNING *`,
      [fecha, hora, area, nombre, usuario]
    );
    
    console.log('✅ Reserva guardada:', result.rows[0]);
    res.json({ mensaje: 'Reserva guardada', reserva: result.rows[0], ok: true });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reservas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservas ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reservas/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const result = await pool.query('UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *', [estado, id]);
    res.json({ mensaje: 'Estado actualizado', reserva: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mensajes
// Enviar mensaje (desde app o panel)
app.post('/api/mensajes', async (req, res) => {
  try {
    const { remitente, destinatario, mensaje } = req.body;
    
    console.log('💬 Nuevo mensaje:', { remitente, destinatario, mensaje });
    
    const result = await pool.query(
      `INSERT INTO mensajes (remitente, destinatario, mensaje, leido, fecha) 
       VALUES ($1, $2, $3, false, NOW()) 
       RETURNING *`,
      [remitente, destinatario, mensaje]
    );
    
    console.log('✅ Mensaje guardado:', result.rows[0]);
    res.json({ mensaje: 'Mensaje enviado', data: result.rows[0], ok: true });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Obtener mensajes de un usuario
app.get('/api/mensajes/:usuario', async (req, res) => {
  try {
    const { usuario } = req.params;
    const result = await pool.query(
      `SELECT * FROM mensajes 
       WHERE remitente = $1 OR destinatario = $1 
       ORDER BY fecha ASC`,
      [usuario]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar mensaje como leído
app.put('/api/mensajes/:id/leido', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE mensajes SET leido = true WHERE id = $1', [id]);
    res.json({ mensaje: 'Mensaje marcado como leído', ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔐 Login: admin@miph.com / admin123`);
});