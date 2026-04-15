const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Forzar uso de DNS de Google
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.join(__dirname, '.env') });

const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('🔍 URI:', process.env.MONGODB_URI);
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ No se encontró MONGODB_URI en .env');
    return;
  }
  
  console.log('⏳ Conectando a MongoDB... (timeout 15 segundos)');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    
    await client.connect();
    console.log('✅ Conectado a MongoDB correctamente');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones encontradas:', collections.map(c => c.name));
    
    await client.close();
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testConnection();