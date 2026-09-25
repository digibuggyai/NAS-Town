-- NASTOWN schema. Safe to run repeatedly (applied on every server start).
-- All prices are INR, GST inclusive. min_price columns are internal floors:
-- they are only ever read by staff routes.

CREATE TABLE IF NOT EXISTS nas_models (
  id                   SERIAL PRIMARY KEY,
  model                TEXT UNIQUE NOT NULL,
  slug                 TEXT UNIQUE NOT NULL,
  brand                TEXT NOT NULL,
  bays                 INTEGER NOT NULL,
  raid                 TEXT[] NOT NULL DEFAULT '{}',
  expandable           BOOLEAN NOT NULL DEFAULT FALSE,
  network              TEXT,
  network_upgrade      TEXT,
  cpu                  TEXT,
  cpu_cores            INTEGER,
  memory               TEXT,
  memory_max           TEXT,
  m2_slots             INTEGER,
  max_drive_tb         INTEGER,
  bays_with_expansion  INTEGER,
  max_raw_tb           INTEGER,
  usb_ports            TEXT,
  dimensions           TEXT,
  weight_kg            NUMERIC,
  warranty             TEXT,
  specs_url            TEXT,
  summary              TEXT,
  best_for             TEXT,
  featured             BOOLEAN NOT NULL DEFAULT FALSE,
  rentable             BOOLEAN NOT NULL DEFAULT FALSE,
  quote_price          INTEGER NOT NULL,
  min_price            INTEGER,
  active               BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nas_drives (
  id           SERIAL PRIMARY KEY,
  capacity_tb  INTEGER NOT NULL,
  line         TEXT NOT NULL,
  quote_price  INTEGER NOT NULL,
  min_price    INTEGER,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (capacity_tb, line)
);

CREATE TABLE IF NOT EXISTS nas_drive_lines (
  id               SERIAL PRIMARY KEY,
  name             TEXT UNIQUE NOT NULL,
  brand            TEXT,
  drive_class      TEXT,
  made_for_brand   TEXT,
  series           TEXT,
  rpm              TEXT,
  cache            TEXT,
  interface        TEXT,
  recording        TEXT,
  workload_tb_year TEXT,
  mtbf             TEXT,
  warranty_years   INTEGER,
  best_for         TEXT,
  extras           TEXT,
  specs_url        TEXT,
  sort_order       INTEGER,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nas_upgrades (
  id           SERIAL PRIMARY KEY,
  sku          TEXT UNIQUE NOT NULL,
  category     TEXT NOT NULL,              -- RAM | NIC
  name         TEXT NOT NULL,
  brand        TEXT,
  spec         TEXT,
  quote_price  INTEGER NOT NULL,
  min_price    INTEGER,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Singleton row (id = 1).
CREATE TABLE IF NOT EXISTS nas_settings (
  id                  INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  install_quote       INTEGER NOT NULL,
  install_min         INTEGER,
  amc_quote_percent   NUMERIC NOT NULL,
  amc_min_percent     NUMERIC,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nas_change_log (
  id           SERIAL PRIMARY KEY,
  editor       TEXT NOT NULL,
  collection   TEXT NOT NULL,
  item_id      INTEGER,
  item_label   TEXT,
  field        TEXT NOT NULL,
  before       TEXT,
  after        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  email          TEXT UNIQUE NOT NULL,
  name           TEXT,
  role           TEXT NOT NULL CHECK (role IN ('admin', 'sales')),
  password_hash  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every form on the site (contact, rental, service, configurator, expert call) lands here.
CREATE TABLE IF NOT EXISTS enquiries (
  id            SERIAL PRIMARY KEY,
  type          TEXT NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  message       TEXT,
  payload       JSONB NOT NULL DEFAULT '{}'::jsonb,
  status        TEXT NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finder_submissions (
  id            SERIAL PRIMARY KEY,
  storing       TEXT NOT NULL,
  capacity      TEXT NOT NULL,
  work_style    TEXT NOT NULL,
  recommended   TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Columns added after first release (safe on existing databases).
ALTER TABLE nas_models ADD COLUMN IF NOT EXISTS best_for TEXT;

CREATE INDEX IF NOT EXISTS idx_enquiries_type ON enquiries (type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_log_created ON nas_change_log (created_at DESC);
