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

// ============================================
// AUTENTICACIÓN
// ============================================

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

// ============================================
// ESTADÍSTICAS
// ============================================

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

// ============================================
// REPORTES
// ============================================

// Obtener todos los reportes
app.get('/api/reportes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reportes ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo reporte (desde app móvil)
app.post('/api/reportes', async (req, res) => {
  try {
    const { tipo, ubicacion, descripcion, urgencia, usuario } = req.body;
    
    console.log('📱 Nuevo reporte desde app:', { tipo, ubicacion, descripcion, urgencia, usuario });
    
    // Verificar que la conexión a la base de datos está activa
    if (!pool) {
      console.error('❌ Pool no está inicializado');
      return res.status(500).json({ error: 'Error de conexión a la base de datos' });
    }
    
    const result = await pool.query(
      `INSERT INTO reportes (tipo, ubicacion, descripcion, urgencia, usuario, estado, fecha) 
       VALUES ($1, $2, $3, $4, $5, 'pendiente', NOW()) 
       RETURNING *`,
      [tipo, ubicacion, descripcion, urgencia, usuario]
    );
    
    console.log('✅ Reporte guardado en BD:', result.rows[0]);
    res.json({ mensaje: 'Reporte guardado', reporte: result.rows[0], ok: true });
    
  } catch (error) {
    console.error('❌ Error en POST /api/reportes:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de un reporte
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

// ============================================
// RESERVAS
// ============================================

app.get('/api/reservas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservas ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
    
    res.json({ mensaje: 'Reserva guardada', reserva: result.rows[0], ok: true });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reservas/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const result = await pool.query('UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *', [estado, id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EMERGENCIAS
// ============================================

app.get('/api/emergencias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emergencias ORDER BY orden ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/emergencias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono, nombre } = req.body;
    const result = await pool.query('UPDATE emergencias SET telefono = $1, nombre = $2 WHERE id = $3 RETURNING *', [telefono, nombre, id]);
    res.json({ mensaje: 'Contacto actualizado', emergencia: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MENSAJES
// ============================================

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
    
    res.json({ mensaje: 'Mensaje enviado', data: result.rows[0], ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mensajes/:usuario', async (req, res) => {
  try {
    const { usuario } = req.params;
    const result = await pool.query(
      'SELECT * FROM mensajes WHERE remitente = $1 OR destinatario = $1 ORDER BY fecha ASC',
      [usuario]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// VISITAS
// ============================================

app.post('/api/visitas', async (req, res) => {
  try {
    const { unidad, nombre_visitante, fecha, hora_entrada, creado_por } = req.body;
    const codigo_qr = `${unidad}-${nombre_visitante}-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO visitas (unidad, nombre_visitante, fecha, hora_entrada, codigo_qr, creado_por) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [unidad, nombre_visitante, fecha, hora_entrada, codigo_qr, creado_por]
    );
    
    res.json({ mensaje: 'Visita creada', visita: result.rows[0], codigo_qr });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/visitas/validar', async (req, res) => {
  try {
    const { codigo_qr } = req.body;
    
    const result = await pool.query(
      `SELECT * FROM visitas WHERE codigo_qr = $1 AND estado = 'activo'`,
      [codigo_qr]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Código QR inválido o expirado' });
    }
    
    await pool.query(
      `UPDATE visitas SET estado = 'usado', hora_entrada = NOW() WHERE id = $1`,
      [result.rows[0].id]
    );
    
    res.json({ mensaje: 'Acceso permitido', visita: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/visitas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitas ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PROVEEDORES
// ============================================

app.get('/api/proveedores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedores ORDER BY especialidad, nombre');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proveedores', async (req, res) => {
  try {
    const { nombre, email, telefono, especialidad } = req.body;
    const result = await pool.query(
      'INSERT INTO proveedores (nombre, email, telefono, especialidad) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, email, telefono, especialidad]
    );
    res.json({ mensaje: 'Proveedor registrado', proveedor: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ordenes', async (req, res) => {
  try {
    const { reporte_id, especialidad, presupuesto } = req.body;
    
    const proveedores = await pool.query(
      'SELECT * FROM proveedores WHERE especialidad = $1 AND disponible = true',
      [especialidad]
    );
    
    if (proveedores.rows.length === 0) {
      return res.status(404).json({ error: 'No hay proveedores disponibles' });
    }
    
    const orden = await pool.query(
      'INSERT INTO ordenes_trabajo (reporte_id, presupuesto, estado) VALUES ($1, $2, $3) RETURNING *',
      [reporte_id, presupuesto, 'pendiente']
    );
    
    res.json({ mensaje: 'Orden publicada', orden: orden.rows[0], proveedores: proveedores.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔐 Login: admin@miph.com / admin123`);
});