import { openDB } from 'idb';

const DB_NAME = 'WereCookedDB';
const STORE_NAME = 'recipes';

export async function initDB() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
  return db;
}

export async function saveRecipesToIndexedDB(recipes) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const recipe of recipes) {
    await tx.store.put(recipe);
  }
  await tx.done;
}

export async function getAllRecipesFromIndexedDB() {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
}
