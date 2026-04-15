const { MongoClient } = require('mongodb');

// Servidor de prueba público (solo para verificar conexión)
const uri = 'mongodb://test:test@cluster0.snlcntp.mongodb.net:27017/test';

async function test() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Conectado al servidor de prueba');
    await client.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}
test();