const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: La variable de entorno DATABASE_URL no está definida.');
  process.exit(1);
}

// Configuración universal que acepta cualquier certificado SSL
const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 15000,
  ssl: {
    rejectUnauthorized: false, // Acepta cualquier certificado (incluyendo autofirmados)
  },
});

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
    client.release();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS propietarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        unidad VARCHAR(10),
        moroso BOOLEAN DEFAULT FALSE
      )
    `);
    
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