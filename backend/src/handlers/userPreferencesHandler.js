const { getDb } = require('../services/db');
const { preferenceSchema } = require('../validations/preferencesValidation');
const { ObjectId } = require('mongodb');

/**
 * Handler untuk menyimpan atau memperbarui preferensi pengguna
 */
async function savePreferencesHandler(request, h) {
  try {
    const userId = request.auth.credentials.id;
    
    // Debug logging
    console.log('User ID:', userId);
    console.log('Request payload:', request.payload);
    
    // Validasi input
    const { error, value } = preferenceSchema.validate(request.payload);
    if (error) {
      console.error('Validation error:', error.details);
      return h
        .response({
          error: true,
          message: `Validasi gagal: ${error.details[0].message}`,
        })
        .code(400);
    }
    console.log('Validated value:', value);
    
    const db = getDb();
    const preferencesCollection = db.collection('userpreferences');
    
    // Struktur data yang konsisten dengan database yang ada
    const updatedPreferences = {
      preferred_categories: value.preferred_categories || [],
      cooking_methods: value.cooking_methods || [],
      avoid_ingredients: value.avoid_ingredients || [],
      preferred_taste: value.preferred_taste || [],
      preferred_time: value.preferred_time || "Siang",
      skill_level: value.skill_level || "Cepat & Mudah",
    };
    console.log('Data to save:', updatedPreferences);
    
    // Gunakan upsert dengan handling yang lebih robust
    const result = await preferencesCollection.findOneAndUpdate(
      { user_id: userId },
      { 
        $set: {
          ...updatedPreferences,
          updated_at: new Date()
        },
        $setOnInsert: {
          user_id: userId, // Pastikan user_id ada saat insert
          created_at: new Date()
        }
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    );
    
    console.log('MongoDB result:', result);
    
    // Handling yang lebih robust untuk response
    let responseData;
    let isNewDocument = false;
    
    if (result.value) {
      // Document ditemukan dan di-update, atau baru dibuat dan langsung di-return
      responseData = {
        id: result.value._id.toString(),
        user_id: result.value.user_id,
        preferred_categories: result.value.preferred_categories || [],
        cooking_methods: result.value.cooking_methods || [],
        avoid_ingredients: result.value.avoid_ingredients || [],
        preferred_taste: result.value.preferred_taste || [],
        preferred_time: result.value.preferred_time || "Siang",
        skill_level: result.value.skill_level || "Cepat & Mudah",
      };
      
      // Check if it was an upsert (new document created)
      isNewDocument = result.lastErrorObject && result.lastErrorObject.upserted;
    } else {
      // Fallback: fetch the document manually (shouldn't happen with returnDocument: 'after')
      const savedDoc = await preferencesCollection.findOne({ user_id: userId });
      if (savedDoc) {
        responseData = {
          id: savedDoc._id.toString(),
          user_id: savedDoc.user_id,
          preferred_categories: savedDoc.preferred_categories || [],
          cooking_methods: savedDoc.cooking_methods || [],
          avoid_ingredients: savedDoc.avoid_ingredients || [],
          preferred_taste: savedDoc.preferred_taste || [],
          preferred_time: savedDoc.preferred_time || "Siang",
          skill_level: savedDoc.skill_level || "Cepat & Mudah",
        };
        isNewDocument = true; // Assume it's new if we had to fetch manually
      } else {
        throw new Error('Failed to retrieve saved preferences');
      }
    }
    
    // Response dengan data yang telah disimpan
    return h
      .response({
        error: false,
        message: isNewDocument 
          ? 'Preferensi pengguna berhasil dibuat.' 
          : 'Preferensi pengguna berhasil diperbarui.',
        data: responseData
      })
      .code(isNewDocument ? 201 : 200);
      
  } catch (error) {
    console.error('Error saving preferences:', error);
    return h
      .response({ 
        error: true, 
        message: 'Terjadi kesalahan saat menyimpan preferensi' 
      })
      .code(500);
  }
}

/**
 * Handler untuk mengambil preferensi pengguna
 */
async function getPreferencesHandler(request, h) {
  try {
    const userId = request.auth.credentials.id;
    
    const db = getDb();
    const preferencesCollection = db.collection('userpreferences');
    
    // Optimasi query dengan projection
    const preferences = await preferencesCollection.findOne(
      { user_id: userId },
      { 
        projection: {
          _id: 1,
          user_id: 1,
          preferred_categories: 1,
          cooking_methods: 1,
          avoid_ingredients: 1,
          preferred_taste: 1,
          preferred_time: 1,
          skill_level: 1,
        }
      }
    );
    
    if (!preferences) {
      return h
        .response({
          error: true,
          message: 'Preferensi pengguna tidak ditemukan.',
        })
        .code(404);
    }
    
    // Transform response untuk konsistensi
    const responseData = {
      id: preferences._id.toString(),
      user_id: preferences.user_id,
      preferred_categories: preferences.preferred_categories || [],
      cooking_methods: preferences.cooking_methods || [],
      avoid_ingredients: preferences.avoid_ingredients || [],
      preferred_taste: preferences.preferred_taste || [],
      preferred_time: preferences.preferred_time || "Siang",
      skill_level: preferences.skill_level || "Cepat & Mudah",
    };
    
    return h
      .response({ 
        error: false, 
        data: responseData 
      })
      .code(200);
      
  } catch (error) {
    console.error('Error getting preferences:', error);
    return h
      .response({ 
        error: true, 
        message: 'Terjadi kesalahan saat mengambil preferensi' 
      })
      .code(500);
  }
}

/**
 * Handler untuk menghapus preferensi pengguna
 */
async function deletePreferencesHandler(request, h) {
  try {
    const userId = request.auth.credentials.id;
    
    const db = getDb();
    const preferencesCollection = db.collection('userpreferences');
    
    const result = await preferencesCollection.deleteOne({ user_id: userId });
    
    if (result.deletedCount === 0) {
      return h
        .response({
          error: true,
          message: 'Preferensi pengguna tidak ditemukan.',
        })
        .code(404);
    }
    
    return h
      .response({
        error: false,
        message: 'Preferensi pengguna berhasil dihapus.',
      })
      .code(200);
      
  } catch (error) {
    console.error('Error deleting preferences:', error);
    return h
      .response({ 
        error: true, 
        message: 'Terjadi kesalahan saat menghapus preferensi' 
      })
      .code(500);
  }
}

/**
 * Handler untuk mengambil preferensi berdasarkan ID (untuk admin)
 */
async function getPreferencesByIdHandler(request, h) {
  try {
    const { id } = request.params;
    
    // Validasi ObjectId
    if (!ObjectId.isValid(id)) {
      return h
        .response({
          error: true,
          message: 'ID preferensi tidak valid.',
        })
        .code(400);
    }
    
    const db = getDb();
    const preferencesCollection = db.collection('userpreferences');
    
    const preferences = await preferencesCollection.findOne(
      { _id: new ObjectId(id) }
    );
    
    if (!preferences) {
      return h
        .response({
          error: true,
          message: 'Preferensi tidak ditemukan.',
        })
        .code(404);
    }
    
    // Transform response
    const responseData = {
      id: preferences._id.toString(),
      user_id: preferences.user_id,
      preferred_categories: preferences.preferred_categories,
      cooking_methods: preferences.cooking_methods,
      avoid_ingredients: preferences.avoid_ingredients,
      preferred_taste: preferences.preferred_taste,
      preferred_time: preferences.preferred_time,
      skill_level: preferences.skill_level,
    };
    
    return h
      .response({ 
        error: false, 
        data: responseData 
      })
      .code(200);
      
  } catch (error) {
    console.error('Error getting preferences by ID:', error);
    return h
      .response({ 
        error: true, 
        message: 'Terjadi kesalahan saat mengambil preferensi' 
      })
      .code(500);
  }
}

module.exports = {
  savePreferencesHandler,
  getPreferencesHandler,
  deletePreferencesHandler,
  getPreferencesByIdHandler,
};