
-- Create admin users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create buyers table for buyer management
CREATE TABLE public.buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for transaction management
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'completed',
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard_metrics table for storing calculated metrics
CREATE TABLE public.dashboard_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL UNIQUE,
  metric_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin users can access all admin_users" ON public.admin_users FOR ALL USING (true);
CREATE POLICY "Admin users can access all buyers" ON public.buyers FOR ALL USING (true);
CREATE POLICY "Admin users can access all transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Admin users can access dashboard metrics" ON public.dashboard_metrics FOR ALL USING (true);

-- Insert initial dashboard metrics
INSERT INTO public.dashboard_metrics (metric_name, metric_value) VALUES
('total_sales', 0),
('total_transactions', 0),
('total_products', 0),
('total_buyers', 0);

-- Create function to update dashboard metrics
CREATE OR REPLACE FUNCTION update_dashboard_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update total sales
  UPDATE public.dashboard_metrics 
  SET metric_value = COALESCE((SELECT SUM(total_amount) FROM public.transactions), 0),
      last_updated = now()
  WHERE metric_name = 'total_sales';
  
  -- Update total transactions
  UPDATE public.dashboard_metrics 
  SET metric_value = COALESCE((SELECT COUNT(*) FROM public.transactions), 0),
      last_updated = now()
  WHERE metric_name = 'total_transactions';
  
  -- Update total products
  UPDATE public.dashboard_metrics 
  SET metric_value = COALESCE((SELECT COUNT(*) FROM public.products), 0),
      last_updated = now()
  WHERE metric_name = 'total_products';
  
  -- Update total buyers
  UPDATE public.dashboard_metrics 
  SET metric_value = COALESCE((SELECT COUNT(*) FROM public.buyers), 0),
      last_updated = now()
  WHERE metric_name = 'total_buyers';
END;
$$;

-- Create trigger to automatically update metrics when transactions change
CREATE OR REPLACE FUNCTION trigger_update_metrics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_dashboard_metrics();
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER transactions_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION trigger_update_metrics();

CREATE TRIGGER products_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION trigger_update_metrics();

CREATE TRIGGER buyers_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.buyers
  FOR EACH ROW EXECUTE FUNCTION trigger_update_metrics();

-- Insert sample buyers data
INSERT INTO public.buyers (email, full_name, phone, address, total_orders, total_spent, status) VALUES
('john.doe@email.com', 'John Doe', '+63 912 345 6789', '123 Main St, Manila', 5, 450.75, 'active'),
('maria.santos@email.com', 'Maria Santos', '+63 917 234 5678', '456 Oak Ave, Quezon City', 3, 280.50, 'active'),
('pedro.garcia@email.com', 'Pedro Garcia', '+63 922 345 6789', '789 Pine St, Cebu', 8, 620.25, 'active'),
('ana.reyes@email.com', 'Ana Reyes', '+63 918 456 7890', '321 Elm St, Davao', 2, 150.00, 'active');

-- Insert sample transactions
INSERT INTO public.transactions (buyer_id, product_id, quantity, unit_price, total_amount, status) 
SELECT 
  b.id as buyer_id,
  p.id as product_id,
  (RANDOM() * 3 + 1)::INTEGER as quantity,
  p.price as unit_price,
  (RANDOM() * 3 + 1)::INTEGER * p.price as total_amount,
  'completed' as status
FROM public.buyers b
CROSS JOIN public.products p
WHERE RANDOM() < 0.3
LIMIT 20;

-- Update the dashboard metrics initially
SELECT update_dashboard_metrics();
