-- CMM Grid — PostgreSQL Schema
-- CMM Electricals Inventory Management System

-- Products (SKU master list)
CREATE TABLE IF NOT EXISTS products (
  id                  SERIAL PRIMARY KEY,
  sku                 VARCHAR(50) UNIQUE NOT NULL,
  name                VARCHAR(255) NOT NULL,
  unit                VARCHAR(20) NOT NULL DEFAULT 'Piece',
  total_qty           INTEGER NOT NULL DEFAULT 0,
  warehouse_qty       INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  unit_price          DECIMAL(10, 2) DEFAULT 0,
  invoice_no          VARCHAR(100),
  bill_url            TEXT,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Projects (site records)
CREATE TABLE IF NOT EXISTS projects (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  site_address TEXT,
  status       VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                 CHECK (status IN ('ACTIVE', 'COMPLETED', 'ON_HOLD')),
  budget       DECIMAL(12, 2) DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Allocations (warehouse → site movements)
CREATE TABLE IF NOT EXISTS allocations (
  id              SERIAL PRIMARY KEY,
  product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  allocated_date  DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Usages (On-site consumption)
CREATE TABLE IF NOT EXISTS usages (
  id              SERIAL PRIMARY KEY,
  product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  used_date       DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workers (Labour master list)
CREATE TABLE IF NOT EXISTS workers (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  phone        VARCHAR(20),
  trade        VARCHAR(100),
  daily_rate   DECIMAL(10, 2) NOT NULL,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Assignments (Worker to project site)
CREATE TABLE IF NOT EXISTS assignments (
  id           SERIAL PRIMARY KEY,
  worker_id    INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  start_date   DATE NOT NULL,
  end_date     DATE,
  notes        TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Attendance (Daily records)
CREATE TABLE IF NOT EXISTS attendance (
  id           SERIAL PRIMARY KEY,
  worker_id    INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  present      BOOLEAN DEFAULT TRUE,
  notes        TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(worker_id, date)
);

-- Payments (Salary/Wage records)
CREATE TABLE IF NOT EXISTS payments (
  id               SERIAL PRIMARY KEY,
  worker_id        INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount           DECIMAL(10, 2) NOT NULL,
  base_wage        DECIMAL(10, 2) NOT NULL,
  food_allowance   DECIMAL(10, 2) DEFAULT 0,
  travel_allowance DECIMAL(10, 2) DEFAULT 0,
  other_allowance  DECIMAL(10, 2) DEFAULT 0,
  week_start       DATE NOT NULL,
  week_end         DATE NOT NULL,
  paid_date        DATE NOT NULL,
  days_worked      INTEGER NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Client Payments (Receivables)
CREATE TABLE IF NOT EXISTS client_payments (
  id           SERIAL PRIMARY KEY,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount       DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  invoice_no   VARCHAR(100),
  notes        TEXT,
  bill_url     TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Direct Purchases (Project-specific expenses)
CREATE TABLE IF NOT EXISTS direct_purchases (
  id           SERIAL PRIMARY KEY,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description  TEXT NOT NULL,
  amount       DECIMAL(12, 2) NOT NULL,
  date         DATE NOT NULL,
  invoice_no   VARCHAR(100),
  notes        TEXT,
  bill_url     TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- System Users (Access Control)
CREATE TABLE IF NOT EXISTS system_users (
  id           VARCHAR(255) PRIMARY KEY, -- Email used as ID
  email        VARCHAR(255) UNIQUE NOT NULL,
  name         VARCHAR(255),
  image        TEXT,
  role         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                 CHECK (role IN ('ADMIN', 'USER', 'PENDING', 'REJECTED')),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Settings (Company-wide configuration)
CREATE TABLE IF NOT EXISTS settings (
  id           INTEGER PRIMARY KEY CHECK (id = 1), -- Singleton table
  company_name VARCHAR(255) DEFAULT 'CMM Electricals',
  company_address TEXT,
  company_phone VARCHAR(50),
  company_email VARCHAR(255),
  default_low_stock_threshold INTEGER DEFAULT 50,
  default_daily_rate DECIMAL(10, 2) DEFAULT 600,
  currency VARCHAR(10) DEFAULT 'INR',
  report_footer TEXT DEFAULT 'Confidential — CMM Electricals',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Initialize settings
INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_allocations_product    ON allocations(product_id);
CREATE INDEX IF NOT EXISTS idx_allocations_project    ON allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_usages_product         ON usages(product_id);
CREATE INDEX IF NOT EXISTS idx_usages_project         ON usages(project_id);
CREATE INDEX IF NOT EXISTS idx_attendance_worker      ON attendance(worker_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date        ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_payments_worker        ON payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_proj   ON client_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_direct_purchases_proj  ON direct_purchases(project_id);
