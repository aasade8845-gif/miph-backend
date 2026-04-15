const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

let client;
let db;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db();
  }
  return db;
}

async function crearUsuarioAdmin() {
  const db = await connectDB();
  const usuarios = db.collection('usuarios');
  
  const existeAdmin = await usuarios.findOne({ email: 'admin@miph.com' });
  if (!existeAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await usuarios.insertOne({
      email: 'admin@miph.com',
      password: hashedPassword,
      nombre: 'Administrador',
      rol: 'admin'
    });
    console.log('Usuario administrador creado: admin@miph.com / admin123');
  }
}

module.exports = { connectDB, crearUsuarioAdmin };