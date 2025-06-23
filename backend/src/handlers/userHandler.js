const Boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const Joi = require('joi');
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
  try {
    const payload = request.payload;
    const userId = request.auth.credentials.id;
    const db = getDb();

    console.log('Update Profile - User ID:', userId);
    console.log('Update Profile - Payload:', payload);

    // Get current user data
    const currentUser = await db.collection('users').findOne({ id: userId });
    if (!currentUser) {
      return Boom.notFound('User tidak ditemukan');
    }

    // Build update data object
    const updateData = {};

    // Nama validation (jika ada)
    if (payload.name !== undefined) {
      if (!payload.name || payload.name.trim().length < 3) {
        return Boom.badRequest('Nama harus diisi minimal 3 karakter.');
      }
      updateData.name = payload.name.trim();
    }

    // Email validation (jika ada dan tidak kosong)
    if (payload.email !== undefined && payload.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        return Boom.badRequest('Format email tidak valid.');
      }
      
      // Check if email already exists for other users
      const existingUser = await db
        .collection('users')
        .findOne({ email: payload.email.trim(), id: { $ne: userId } });
      if (existingUser) {
        return Boom.badRequest('Email sudah digunakan oleh pengguna lain.');
      }
      updateData.email = payload.email.trim();
    }

    // Phone validation (jika ada dan tidak kosong)
    if (payload.phone !== undefined && payload.phone.trim() !== '') {
      const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
      if (!phoneRegex.test(payload.phone)) {
        return Boom.badRequest('Format nomor telepon tidak valid.');
      }
      updateData.phone = payload.phone.trim();
    }

    // Gender validation (jika ada dan tidak kosong)
    if (payload.gender !== undefined && payload.gender !== '') {
      if (!['male', 'female', 'other'].includes(payload.gender)) {
        return Boom.badRequest('Jenis kelamin tidak valid.');
      }
      updateData.gender = payload.gender;
    }

    // Birth date validation (jika ada dan tidak kosong)
    if (payload.birthDate !== undefined && payload.birthDate !== '') {
      if (isNaN(Date.parse(payload.birthDate))) {
        return Boom.badRequest('Format tanggal lahir tidak valid.');
      }
      updateData.birthDate = payload.birthDate;
    }

    // Location (jika ada)
    if (payload.location !== undefined) {
      updateData.location = payload.location.trim();
    }

    // Photo handling (base64 atau URL)
    if (payload.photo !== undefined) {
      updateData.photo = payload.photo;
    }

    // Check if there are actual changes
    if (Object.keys(updateData).length === 0) {
      return Boom.badRequest('Tidak ada perubahan yang dilakukan.');
    }

    // Set updated timestamp
    updateData.updatedAt = new Date().toISOString();

    console.log('Update Data:', updateData);

    // Perform update
    const updateResult = await db
      .collection('users')
      .updateOne({ id: userId }, { $set: updateData });

    if (updateResult.matchedCount === 0) {
      return Boom.notFound('User tidak ditemukan');
    }

    // Get updated user data
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

  } catch (error) {
    console.error('Update Profile Error:', error);
    return Boom.internal('Terjadi kesalahan server');
  }
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

// Handler untuk Forgot Password (tanpa autentikasi)
const forgotPassword = async (request, h) => {
  try {
    // ✅ PERBAIKAN: Sesuaikan dengan yang dikirim frontend
    const { email, newPassword } = request.payload;
    
    // Validasi input
    if (!email || !newPassword) {
      return Boom.badRequest('Email dan password baru harus diisi');
    }
    
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Boom.badRequest('Format email tidak valid');
    }
    
    // Validasi panjang password
    if (newPassword.length < 8) {
      return Boom.badRequest('Password minimal 8 karakter');
    }
    
    const db = getDb();
    
    // Cek apakah user dengan email tersebut ada
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return Boom.notFound('Email tidak ditemukan');
    }
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password di database
    const updateResult = await db
      .collection('users')
      .updateOne(
        { email },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );
    
    if (updateResult.matchedCount === 0) {
      return Boom.internal('Gagal mengupdate password');
    }
    
    // Log aktivitas (opsional)
    console.log(`Password reset untuk email: ${email} pada ${new Date()}`);
    
    return h
      .response({
        error: false,
        message: 'Password berhasil direset'
      })
      .code(200);
      
  } catch (error) {
    console.error('Error forgot password:', error);
    return Boom.internal('Terjadi kesalahan server');
  }
};

// Handler untuk Change Password (dengan autentikasi)
const changePassword = async (request, h) => {
  try {
    // ✅ PERBAIKAN: Sesuaikan dengan yang dikirim frontend
    const { newPassword } = request.payload;
    
    // ✅ PERBAIKAN: Ambil user ID dari credentials yang sudah ter-autentikasi
    const userId = request.auth.credentials.id;
    const userEmail = request.auth.credentials.email; // Jika tersedia
    
    // Validasi input
    if (!newPassword) {
      return Boom.badRequest('Password baru harus diisi');
    }
    
    // Validasi panjang password
    if (newPassword.length < 8) {
      return Boom.badRequest('Password minimal 8 karakter');
    }
    
    const db = getDb();
    
    // Cek apakah user ada
    const user = await db.collection('users').findOne({ id: userId });
    
    if (!user) {
      return Boom.notFound('User tidak ditemukan');
    }
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password di database
    const updateResult = await db
      .collection('users')
      .updateOne(
        { id: userId },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );
    
    if (updateResult.matchedCount === 0) {
      return Boom.internal('Gagal mengubah password');
    }
    
    // Log aktivitas
    console.log(`Password changed untuk user ID: ${userId} (${user.email}) pada ${new Date()}`);
    
    return h
      .response({
        error: false,
        message: 'Password berhasil diubah'
      })
      .code(200);
      
  } catch (error) {
    console.error('Error change password:', error);
    return Boom.internal('Terjadi kesalahan server');
  }
};

module.exports = { 
  getProfile, 
  updateProfile, 
  updatePassword, 
  forgotPassword, 
  changePassword 
};