const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: La variable de entorno DATABASE_URL no está definida.');
  process.exit(1);
}

// Intentar cargar el certificado CA desde diferentes rutas posibles
let caCert = null;
const possiblePaths = [
  path.join(__dirname, '../ca.pem'),           // backend/models/../ca.pem
  path.join(process.cwd(), 'backend/ca.pem'),  // /opt/render/project/src/backend/ca.pem
  path.join(process.cwd(), 'ca.pem'),          // /opt/render/project/src/ca.pem
];

for (const certPath of possiblePaths) {
  try {
    if (fs.existsSync(certPath)) {
      caCert = fs.readFileSync(certPath).toString();
      console.log(`✅ Certificado CA encontrado en: ${certPath}`);
      break;
    }
  } catch (err) {
    // Ignorar error, seguir buscando
  }
}

if (!caCert) {
  console.warn('⚠️ No se encontró el certificado CA. La conexión SSL podría fallar.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 15000,
  ...(caCert && {
    ssl: {
      ca: caCert,
      rejectUnauthorized: true,
    },
  }),
  ...(!caCert && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a la base de datos PostgreSQL (Aiven)');
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