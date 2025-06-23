
-- Remove the default admin account
DELETE FROM public.admin_users WHERE email = 'admin@minimart.com';

-- Insert sample products to fix the "No products available" issue
INSERT INTO public.products (name, description, price, category, stock, is_featured, image_url) VALUES
('Chicharon', 'Crispy pork skin snack, a Filipino favorite', 25.00, 'Chips', 50, true, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'),
('Banana Chips', 'Sweet and crispy banana chips', 15.00, 'Chips', 75, true, 'https://images.unsplash.com/photo-1587132161949-b47d2ad79de8?w=400'),
('Polvoron', 'Traditional Filipino shortbread confection', 35.00, 'Sweets', 30, false, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'),
('Dried Mangoes', 'Sweet dried Philippine mangoes', 45.00, 'Dried Fruits', 40, true, 'https://images.unsplash.com/photo-1605027990121-cbae9fc09d5a?w=400'),
('Taho Mix', 'Traditional Filipino soft tofu dessert mix', 20.00, 'Desserts', 25, false, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'),
('Piattos', 'Hexagon-shaped potato chips', 18.00, 'Chips', 60, true, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400');
