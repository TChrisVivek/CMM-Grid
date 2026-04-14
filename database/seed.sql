-- CMM Grid — Production Seed Data
-- This script contains ONLY the essential initial data for system access.

-- System Users (Access Control)
-- This ensures your primary account is always an ADMIN
INSERT INTO system_users (id, email, name, role) VALUES 
  ('admin_id_primary', 'chrisvivek.t@gmail.com', 'Vivek Chris', 'ADMIN'),
  ('admin_id_backup', 'admin@cmmgrid.com', 'System Admin', 'ADMIN')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, id = EXCLUDED.id;

-- Default Settings (Company Profile)
INSERT INTO settings (
  id, 
  company_name, 
  company_address, 
  company_phone, 
  company_email, 
  default_low_stock_threshold, 
  default_daily_rate, 
  currency, 
  report_footer
) VALUES (
  1, 
  'CMM Electricals', 
  '', 
  '', 
  '', 
  50, 
  600, 
  'INR', 
  'Confidential — CMM Electricals'
) ON CONFLICT (id) DO NOTHING;
