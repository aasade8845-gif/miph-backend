const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  connectionTimeoutMillis: 10000,
});

async function connectDB() {
  try {
    console.log('⏳ Conectando a Supabase...');
    const client = await pool.connect();
    console.log('✅ Conectado a Supabase');
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
    console.error('❌ Error conectando a Supabase:', error.message);
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