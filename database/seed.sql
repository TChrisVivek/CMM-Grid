-- CMM Grid — Seed Data
-- Sample data for CMM Electricals development/testing

-- Projects
INSERT INTO projects (name, site_address, status, budget) VALUES
  ('S.R. Associates Site',        'Plot 14, Sector 7, Faridabad',     'ACTIVE', 500000),
  ('Greenview Apartments Block-C','Greenview Colony, Gurgaon',         'ACTIVE', 750000),
  ('Industrial Shed Unit-5',      'IMT Manesar, Phase 2',              'ACTIVE', 300000),
  ('Sharma Residence Rewiring',   'DLF Phase 3, Gurgaon',              'COMPLETED', 45000)
ON CONFLICT DO NOTHING;

-- Products
INSERT INTO products (sku, name, unit, total_qty, warehouse_qty, low_stock_threshold, unit_price) VALUES
  ('WIR-001','2.5mm² PVC Copper Wire (Red)',       'Meter',        2000, 1450, 200, 25.50),
  ('WIR-002','2.5mm² PVC Copper Wire (Black)',     'Meter',        2000, 1380, 200, 25.50),
  ('MCB-001','MCB 16A Single Pole (Legrand)',      'Piece',         200,  142,  20, 180.00),
  ('FIX-001','LED Downlight 12W (Philips)',        'Piece',         300,  215,  30, 450.00)
ON CONFLICT (sku) DO NOTHING;

-- Workers
INSERT INTO workers (name, phone, trade, daily_rate) VALUES
  ('Rajesh Kumar', '9876543210', 'Electrician', 800),
  ('Amit Singh',   '9812345678', 'Helper',      550),
  ('Suresh Pal',   '9765432109', 'Electrician', 850)
ON CONFLICT DO NOTHING;

-- Allocations
INSERT INTO allocations (product_id, project_id, quantity, allocated_date, notes) VALUES
  (1, 1, 300, '2026-03-28', 'Phase 1 internal wiring'),
  (3, 1,  30, '2026-03-28', 'Distribution board MCBs')
ON CONFLICT DO NOTHING;

-- Assignments
INSERT INTO assignments (worker_id, project_id, start_date, notes) VALUES
  (1, 1, '2026-03-25', 'Lead electrician for SR Project'),
  (2, 1, '2026-03-25', NULL)
ON CONFLICT DO NOTHING;

-- Attendance
INSERT INTO attendance (worker_id, project_id, date, present) VALUES
  (1, 1, '2026-04-01', TRUE),
  (2, 1, '2026-04-01', TRUE),
  (1, 1, '2026-04-02', TRUE),
  (2, 1, '2026-04-02', FALSE)
ON CONFLICT (worker_id, date) DO NOTHING;

-- System Users
INSERT INTO system_users (id, email, name, role) VALUES
  ('admin_id', 'admin@cmmgrid.com', 'System Admin', 'ADMIN')
ON CONFLICT (id) DO NOTHING;
