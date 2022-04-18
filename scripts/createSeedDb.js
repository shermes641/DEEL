const {createDb, seedDb} = require("./seedDb");

createSeed().then(r => console.log('Expect undefined: ' + r));

/**
 * Runs on module load, Creates and populates the DB
 * @returns {Promise<void>}
 */
async function createSeed() {
  await createDb();
  await seedDb();
}
