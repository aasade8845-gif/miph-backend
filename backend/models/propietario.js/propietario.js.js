const { MongoClient } = require('mongodb');

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

async function getPropietarios() {
  const db = await connectDB();
  return await db.collection('propietarios').find({}).toArray();
}

async function getMorosos() {
  const db = await connectDB();
  return await db.collection('propietarios').find({ moroso: true }).toArray();
}

module.exports = { connectDB, getPropietarios, getMorosos };