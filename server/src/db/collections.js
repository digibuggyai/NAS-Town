// Editable catalogue collections: API (camelCase) field → type. The DB column is
// the snake_case of the field. Admin writes are validated against these lists,
// so nothing outside them can be written.

export const COLLECTIONS = {
  models: {
    table: 'nas_models',
    label: 'NAS models',
    order: 'bays, quote_price',
    required: ['model', 'brand', 'bays', 'quotePrice'],
    fields: {
      model: 'text', slug: 'text', brand: 'text', bays: 'int', raid: 'text[]', expandable: 'bool',
      network: 'text', networkUpgrade: 'text', cpu: 'text', cpuCores: 'int', memory: 'text', memoryMax: 'text',
      m2Slots: 'int', maxDriveTb: 'int', baysWithExpansion: 'int', maxRawTb: 'int', usbPorts: 'text',
      dimensions: 'text', weightKg: 'num', warranty: 'text', specsUrl: 'text', summary: 'text',
      featured: 'bool', rentable: 'bool', quotePrice: 'int', minPrice: 'int', active: 'bool',
    },
  },
  drives: {
    table: 'nas_drives',
    label: 'Drives',
    order: 'capacity_tb, line',
    required: ['capacityTb', 'line', 'quotePrice'],
    fields: { capacityTb: 'int', line: 'text', quotePrice: 'int', minPrice: 'int', active: 'bool' },
  },
  driveLines: {
    table: 'nas_drive_lines',
    label: 'Drive specs',
    order: 'sort_order, name',
    required: ['name'],
    fields: {
      name: 'text', brand: 'text', driveClass: 'text', madeForBrand: 'text', series: 'text', rpm: 'text',
      cache: 'text', interface: 'text', recording: 'text', workloadTbYear: 'text', mtbf: 'text',
      warrantyYears: 'int', bestFor: 'text', extras: 'text', specsUrl: 'text', sortOrder: 'int',
    },
  },
  upgrades: {
    table: 'nas_upgrades',
    label: 'Upgrades',
    order: 'category, quote_price',
    required: ['sku', 'category', 'name', 'quotePrice'],
    fields: { sku: 'text', category: 'text', name: 'text', brand: 'text', spec: 'text', quotePrice: 'int', minPrice: 'int', active: 'bool' },
  },
};

export const SETTINGS_FIELDS = { installQuote: 'int', installMin: 'int', amcQuotePercent: 'num', amcMinPercent: 'num' };

export const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
export const camel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

/** Coerce and whitelist an incoming object. Unknown fields are dropped; bad values throw. */
export function clean(fields, input, { partial = false } = {}) {
  const out = {};
  for (const [key, type] of Object.entries(fields)) {
    if (!(key in input)) continue;
    let v = input[key];
    if (v === '' || v === undefined) v = null;
    if (v !== null) {
      if (type === 'int' || type === 'num') {
        v = Number(v);
        if (!Number.isFinite(v)) throw new Error(`${key} must be a number`);
        if (type === 'int') v = Math.round(v);
        if (v < 0) throw new Error(`${key} cannot be negative`);
      } else if (type === 'bool') {
        v = v === true || v === 'true' || v === 1;
      } else if (type === 'text[]') {
        v = (Array.isArray(v) ? v : String(v).split(',')).map((s) => String(s).trim()).filter(Boolean);
      } else {
        v = String(v).trim().slice(0, 2000);
      }
    }
    out[key] = v;
  }
  if (!partial && !Object.keys(out).length) throw new Error('Nothing to save');
  return out;
}
