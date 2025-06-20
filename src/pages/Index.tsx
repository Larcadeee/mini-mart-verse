
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/landing/HeroSection";
import ProductGrid from "@/components/landing/ProductGrid";
import FeaturesSection from "@/components/landing/FeaturesSection";
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

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchCartItems();
      fetchUserProfile();
    }
  }, [user]);

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
      setProducts(data || []);
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
    if (!user) {
      navigate('/auth');
      return;
    }

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
    toast.success('Signed out successfully');
  };

  const handleShopNow = () => {
    const featuredSection = document.getElementById('featured-products');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <Header
        user={user}
        userProfile={userProfile}
        cartItems={cartItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSignOut={handleSignOut}
      />

      <HeroSection
        user={user}
        onShopNow={handleShopNow}
      />

      <ProductGrid
        products={products}
        searchQuery={searchQuery}
        cartItems={cartItems}
        wishlist={wishlist}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
      />

      <FeaturesSection />

      <Footer />
    </div>
  );
};

export default Index;
