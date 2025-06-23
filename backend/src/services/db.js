const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db;

const connectToMongo = async () => {
  if (!db) {
    try {
      await client.connect();
      db = client.db('CC25-CF275');
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err;
    }
  }
  return db;
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectToMongo() first.');
  }
  return db;
};

module.exports = { connectToMongo, getDb };
