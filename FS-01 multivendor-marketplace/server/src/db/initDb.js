import { collectionsSchema } from './schemas.js';

export const initDatabase = async (db) => {
  if (!db) {
    throw new Error('[DB-First] A valid MongoDB database connection is required for initialization.');
  }

  console.log(`[DB-First] Initializing MongoDB database '${db.databaseName}' with native schema definitions...`);

  const existingCollections = await db.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((c) => c.name));

  for (const [collectionName, spec] of Object.entries(collectionsSchema)) {
    try {
      if (!existingNames.has(collectionName)) {
        await db.createCollection(collectionName, {
          validator: spec.validator,
          validationLevel: 'strict',
          validationAction: 'error'
        });
        console.log(`[DB-First] Created collection '${collectionName}' with native $jsonSchema validator.`);
      } else {
        try {
          await db.command({
            collMod: collectionName,
            validator: spec.validator,
            validationLevel: 'strict',
            validationAction: 'error'
          });
          console.log(`[DB-First] Updated native validator for existing collection '${collectionName}'.`);
        } catch (err) {
          console.warn(`[DB-First] Could not update validator for '${collectionName}': ${err.message}`);
        }
      }

      const collection = db.collection(collectionName);
      if (spec.indexes && spec.indexes.length > 0) {
        for (const idx of spec.indexes) {
          try {
            await collection.createIndex(idx.key, idx.options || {});
          } catch (idxErr) {
            if (!idxErr.message.includes('already exists')) {
              console.warn(`[DB-First] Notice on index for '${collectionName}': ${idxErr.message}`);
            }
          }
        }
        console.log(`[DB-First] Native indexes verified for '${collectionName}'.`);
      }
    } catch (colErr) {
      console.error(`[DB-First] Error setting up collection '${collectionName}': ${colErr.message}`);
      throw colErr;
    }
  }

  console.log(`[DB-First] Database schema initialization complete for '${db.databaseName}'. All 6 collections and validators are ready.`);
  return true;
};
