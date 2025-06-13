const { getDb } = require('../services/db');

async function getBookmarks(request, h) {
  const userId = request.auth.credentials.id;
  const db = getDb();

  const userBookmarks = await db
    .collection('bookmarks')
    .find({ userId })
    .project({ _id: 0 })
    .toArray();

  return h.response({ error: false, data: userBookmarks }).code(200);
}

async function addBookmark(request, h) {
  const userId = request.auth.credentials.id;
  const { recipeId, title, image } = request.payload;
  const db = getDb();

  const exists = await db.collection('bookmarks').findOne({ userId, recipeId });
  if (exists) {
    return h
      .response({ error: true, message: 'Resep sudah dibookmark' })
      .code(409);
  }

  const newBookmark = {
    userId,
    recipeId,
    title,
    image,
    createdAt: new Date(),
  };

  await db.collection('bookmarks').insertOne(newBookmark);
  return h
    .response({ error: false, message: 'Bookmark berhasil ditambahkan' })
    .code(201);
}

async function deleteBookmark(request, h) {
  const userId = request.auth.credentials.id;
  const { id } = request.params;
  const db = getDb();

  const result = await db.collection('bookmarks').deleteOne({ userId, id });
  if (result.deletedCount === 0) {
    return h
      .response({ error: true, message: 'Bookmark tidak ditemukan' })
      .code(404);
  }

  return h.response({ error: false, message: 'Bookmark dihapus' }).code(200);
}

module.exports = {
  getBookmarks,
  addBookmark,
  deleteBookmark,
};
