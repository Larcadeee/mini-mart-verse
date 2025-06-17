
-- Create products table with Filipino snacks
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart table for user cart items
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES public.products NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on products (public read access)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to products
CREATE POLICY "Products are viewable by everyone" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for cart_items (users can only access their own cart)
CREATE POLICY "Users can view their own cart items" 
  ON public.cart_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" 
  ON public.cart_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
  ON public.cart_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
  ON public.cart_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert sample Filipino snacks and products
INSERT INTO public.products (name, description, price, image_url, category, stock, is_featured) VALUES
('Chicharon Bulaklak', 'Crispy pork intestine crackling, a Filipino favorite', 85.00, 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&h=300&fit=crop', 'Snacks', 25, true),
('Dried Mangoes', 'Sweet and chewy dried mangoes from Cebu', 120.00, 'https://images.unsplash.com/photo-1553279408-20459e4c09be?w=300&h=300&fit=crop', 'Dried Fruits', 40, true),
('Polvoron', 'Traditional Filipino shortbread candy with milk powder', 65.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop', 'Sweets', 30, false),
('Banana Chips', 'Crispy fried banana chips, sweet and salty', 45.00, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', 'Chips', 50, true),
('Tamarind Candy', 'Sweet and sour tamarind candy balls', 35.00, 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=300&h=300&fit=crop', 'Candy', 60, false),
('Pili Nuts', 'Premium pili nuts from Bicol region', 180.00, 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=300&fit=crop', 'Nuts', 20, true),
('Biko Rice Cake', 'Sticky rice cake with coconut and brown sugar', 95.00, 'https://images.unsplash.com/photo-1587736797235-88b65d9b7c38?w=300&h=300&fit=crop', 'Rice Cakes', 15, false),
('Champorado Mix', 'Chocolate rice porridge mix, perfect for breakfast', 75.00, 'https://images.unsplash.com/photo-1571197119277-7ce0d4419a60?w=300&h=300&fit=crop', 'Breakfast', 35, false),
('Ube Halaya', 'Purple yam dessert, creamy and sweet', 110.00, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop', 'Desserts', 18, true),
('Fishball Snacks', 'Deep-fried fish balls, street food favorite', 25.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop', 'Street Food', 45, false),
('Coconut Strips', 'Sweetened coconut strips, chewy and delicious', 55.00, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop', 'Coconut Products', 40, false),
('Lengua de Gato', 'Cat tongue cookies, thin and crispy', 70.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop', 'Cookies', 25, false);
