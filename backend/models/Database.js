const { Pool } = require('pg');

// La variable de entorno debe llamarse DATABASE_URL en Render
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: La variable de entorno DATABASE_URL no está definida.');
  process.exit(1); // Detiene la aplicación si no hay base de datos
}

// Configuración mejorada para Aiven
const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false, // Acepta certificados autofirmados como los de Aiven
    sslmode: 'require',        // Fuerza el uso de SSL
  },
});

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos PostgreSQL (Aiven)');
    client.release();

    // Crear tabla de propietarios si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS propietarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        unidad VARCHAR(10),
        moroso BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Insertar datos de ejemplo si la tabla está vacía
    const result = await pool.query('SELECT COUNT(*) FROM propietarios');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO propietarios (nombre, unidad, moroso) VALUES
        ('Juan Perez', '101', true),
        ('Maria Gomez', '102', false),
        ('Carlos Ruiz', '201', true),
        ('Ana Lopez', '202', false),
        ('Pedro Martinez', '301', true)
      `);
      console.log('📊 Datos de ejemplo cargados');
    }
    
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    throw error;
  }
}

async function getPropietarios() {
  const result = await pool.query('SELECT * FROM propietarios');
  return result.rows;
}

async function getMorosos() {
  const result = await pool.query('SELECT * FROM propietarios WHERE moroso = true');
  return result.rows;
}

module.exports = { connectDB, getPropietarios, getMorosos, pool };