const { getDb } = require('./db');
const { v4: uuidv4 } = require('uuid');

const saveUser = async (user) => {
  const db = getDb();
  const newUser = { id: uuidv4(), ...user };
  await db.collection('users').insertOne(newUser);
  return newUser;
};

const isEmailTaken = async (email) => {
  const db = getDb();
  const user = await db.collection('users').findOne({ email });
  return !!user;
};

const getUserByEmail = async (email) => {
  const db = getDb();
  return db.collection('users').findOne({ email });
};

module.exports = { saveUser, isEmailTaken, getUserByEmail };
