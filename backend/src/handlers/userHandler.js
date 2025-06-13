const Boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { getDb } = require('../services/db');

const getProfile = async (request, h) => {
  const userId = request.auth.credentials.id;
  const db = getDb();

  const user = await db
    .collection('users')
    .findOne({ id: userId }, { projection: { password: 0, _id: 0 } });
  if (!user) return Boom.notFound('User tidak ditemukan');

  return h
    .response({
      error: false,
      message: 'Berhasil mendapatkan profil',
      user,
    })
    .code(200);
};

const updateProfile = async (request, h) => {
  const { name, photo } = request.payload;
  const userId = request.auth.credentials.id;

  if (!name || name.length < 3) {
    return Boom.badRequest('Nama harus diisi minimal 3 karakter.');
  }

  const db = getDb();
  const updateResult = await db
    .collection('users')
    .updateOne({ id: userId }, { $set: { name, photo: photo || '' } });

  if (updateResult.matchedCount === 0) {
    return Boom.notFound('User tidak ditemukan');
  }

  const user = await db
    .collection('users')
    .findOne({ id: userId }, { projection: { password: 0, _id: 0 } });

  return h
    .response({
      error: false,
      message: 'Profil berhasil diperbarui',
      user,
    })
    .code(200);
};

const updatePassword = async (request, h) => {
  const { currentPassword, newPassword } = request.payload;
  const userId = request.auth.credentials.id;
  const db = getDb();

  const user = await db.collection('users').findOne({ id: userId });
  if (!user) return Boom.notFound('User tidak ditemukan');

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return Boom.unauthorized('Password saat ini salah');

  if (!newPassword || newPassword.length < 8) {
    return Boom.badRequest('Password baru minimal 8 karakter');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db
    .collection('users')
    .updateOne({ id: userId }, { $set: { password: hashedPassword } });

  return h
    .response({ error: false, message: 'Password berhasil diperbarui' })
    .code(200);
};

module.exports = { getProfile, updateProfile, updatePassword };
