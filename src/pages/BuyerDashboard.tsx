
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import ProductGrid from "@/components/landing/ProductGrid";
import Footer from "@/components/layout/Footer";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  is_featured: boolean;
}

interface UserProfile {
  full_name: string;
  role: string;
}

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProducts();
    fetchCartItems();
    fetchUserProfile();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const allProducts = data || [];
      setProducts(allProducts);
      setFeaturedProducts(allProducts.filter(product => product.is_featured));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data?.map(item => item.product_id) || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) throw error;
      
      setCartItems([...cartItems, productId]);
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header
        user={user}
        userProfile={userProfile}
        cartItems={cartItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSignOut={handleSignOut}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-theme-primary mb-4">
            Welcome, {userProfile?.full_name || user?.email}!
          </h1>
          <p className="text-xl text-gray-600">Your Snack Dashboard</p>
        </div>

        {/* Featured Snacks Section */}
        {featuredProducts.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-theme-primary mb-4">Featured Snacks</h2>
              <p className="text-lg text-gray-600">Our handpicked favorites just for you</p>
            </div>
            <ProductGrid
              products={featuredProducts}
              searchQuery=""
              cartItems={cartItems}
              wishlist={wishlist}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
            />
          </section>
        )}

        {/* All Snacks Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-theme-primary mb-4">All Snacks</h2>
            <p className="text-lg text-gray-600">Browse our complete collection</p>
          </div>
          <ProductGrid
            products={products}
            searchQuery={searchQuery}
            cartItems={cartItems}
            wishlist={wishlist}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
          />
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default BuyerDashboard;
