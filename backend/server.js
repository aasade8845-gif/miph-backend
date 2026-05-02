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

// ============================================
// RED DE PROVEEDORES
// ============================================

// Obtener todos los proveedores (para el panel web)
app.get('/api/proveedores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedores ORDER BY especialidad, nombre');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar un nuevo proveedor
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

// Publicar una orden de trabajo (desde un reporte)
app.post('/api/ordenes', async (req, res) => {
  try {
    const { reporte_id, especialidad, presupuesto } = req.body;
    
    // Buscar proveedores disponibles de esa especialidad
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

// Proveedor acepta una orden
app.put('/api/ordenes/:id/aceptar', async (req, res) => {
  try {
    const { id } = req.params;
    const { proveedor_id } = req.body;
    
    const result = await pool.query(
      'UPDATE ordenes_trabajo SET proveedor_id = $1, estado = $2, fecha_asignacion = NOW() WHERE id = $3 RETURNING *',
      [proveedor_id, 'aceptada', id]
    );
    
    res.json({ mensaje: 'Orden aceptada', orden: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener órdenes pendientes (para proveedores)
app.get('/api/ordenes/pendientes', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, r.tipo, r.ubicacion, r.descripcion, r.urgencia 
       FROM ordenes_trabajo o 
       JOIN reportes r ON o.reporte_id = r.id 
       WHERE o.estado = 'pendiente' 
       ORDER BY r.urgencia DESC, o.creado_en ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los contactos de emergencia
app.get('/api/emergencias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM emergencias ORDER BY orden ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un contacto de emergencia (solo admin)
app.put('/api/emergencias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono, nombre } = req.body;
    
    const result = await pool.query(
      'UPDATE emergencias SET telefono = $1, nombre = $2 WHERE id = $3 RETURNING *',
      [telefono, nombre, id]
    );
    
    res.json({ mensaje: 'Contacto actualizado', emergencia: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva visita (propietario)
app.post('/api/visitas', async (req, res) => {
  try {
    const { unidad, nombre_visitante, fecha, hora_entrada, creado_por } = req.body;
    
    // Generar código QR único
    const codigo_qr = `${unidad}-${nombre_visitante}-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO visitas (unidad, nombre_visitante, fecha, hora_entrada, codigo_qr, creado_por, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, 'activo') 
       RETURNING *`,
      [unidad, nombre_visitante, fecha, hora_entrada, codigo_qr, creado_por]
    );
    
    res.json({ mensaje: 'Visita creada', visita: result.rows[0], codigo_qr });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validar una visita (escanear QR)
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
    
    // Marcar como usado
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

// Obtener visitas por unidad (propietario)
app.get('/api/visitas/unidad/:unidad', async (req, res) => {
  try {
    const { unidad } = req.params;
    const result = await pool.query(
      'SELECT * FROM visitas WHERE unidad = $1 ORDER BY fecha DESC',
      [unidad]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las visitas (administrador)
app.get('/api/visitas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitas ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔐 Login: admin@miph.com / admin123`);
});