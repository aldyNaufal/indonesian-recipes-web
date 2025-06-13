const { getDb } = require('../services/db');
const { preferenceSchema } = require('../validations/preferencesValidation');

async function savePreferencesHandler(request, h) {
  try {
    const userId = request.auth.credentials.id;

    const { error, value } = preferenceSchema.validate(request.payload);

    if (error) {
      return h
        .response({
          error: true,
          message: `Validasi gagal: ${error.details[0].message}`,
        })
        .code(400);
    }

    const db = getDb();
    const preferencesCollection = db.collection('userpreferences');

    const updatedPreferences = {
      preferred_categories: value.preferred_categories,
      difficulty_preference: value.difficulty_preference,
      max_ingredients: value.max_ingredients,
      max_steps: value.max_steps,
      cooking_methods: value.cooking_methods,
    };

    const result = await preferencesCollection.updateOne(
      { user_id: userId },
      { $set: updatedPreferences },
      { upsert: true },
    );

    return h
      .response({
        error: false,
        message: 'Preferensi pengguna berhasil disimpan atau diperbarui.',
        data: updatedPreferences,
      })
      .code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: true, message: 'Terjadi kesalahan' }).code(500);
  }
}

async function getPreferencesHandler(request, h) {
  try {
    const userId = request.auth.credentials.id;
    const db = getDb();

    const preferences = await db
      .collection('userpreferences')
      .findOne({ user_id: userId });

    if (!preferences) {
      return h
        .response({
          error: true,
          message: 'Preferensi pengguna tidak ditemukan.',
        })
        .code(404);
    }

    preferences.id = preferences._id.toString();
    delete preferences._id;

    return h.response({ error: false, data: preferences }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: true, message: 'Terjadi kesalahan' }).code(500);
  }
}

module.exports = {
  savePreferencesHandler,
  getPreferencesHandler,
};
