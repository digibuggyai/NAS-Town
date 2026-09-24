-- NASTOWN schema. Safe to run repeatedly (applied on every server start).

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  brand         TEXT NOT NULL,            -- synology | qnap | ugreen | asustor
  model         TEXT NOT NULL,
  bays          INTEGER NOT NULL,
  cpu           TEXT,
  memory        TEXT,
  network       TEXT,
  key_spec      TEXT,
  segment       TEXT NOT NULL,            -- home | creator | business | enterprise
  use_cases     TEXT[] NOT NULL DEFAULT '{}',
  max_raw_tb    INTEGER,
  price_inr     INTEGER,                  -- indicative; NULL = price on request
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  rentable      BOOLEAN NOT NULL DEFAULT FALSE,
  summary       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every form on the site (contact, rental, service, configurator, expert call) lands here.
CREATE TABLE IF NOT EXISTS enquiries (
  id            SERIAL PRIMARY KEY,
  type          TEXT NOT NULL,            -- contact | rental | service | configurator | expert
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

CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);
CREATE INDEX IF NOT EXISTS idx_enquiries_type ON enquiries (type, created_at DESC);
