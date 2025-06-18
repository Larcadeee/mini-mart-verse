
-- Insert a sample admin user for testing
INSERT INTO public.admin_users (email, password_hash, full_name, role, is_active) VALUES
('admin@minimart.com', 'admin123', 'Admin User', 'admin', true);
