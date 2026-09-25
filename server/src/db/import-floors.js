// Applies internal floor prices from floors.local.json to the database.
// Usage (e.g. against Railway): DATABASE_URL=postgres://... npm run import-floors
import 'dotenv/config';
import * as store from './store.js';

const floors = store.readFloorsFile();
if (!floors) {
  console.error('floors.local.json not found next to store.js');
  process.exit(1);
}
if (!store.usingDatabase) {
  console.error('DATABASE_URL is not set: nothing to import into.');
  process.exit(1);
}
await store.init();
const n = await store.applyFloors(floors);
await store.logChanges([{ editor: 'import-floors', collection: 'all', field: 'minPrice', after: `${n} floors imported` }]);
console.log(`Imported ${n} floor prices.`);
process.exit(0);
