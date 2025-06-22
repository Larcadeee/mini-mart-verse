
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/landing/HeroSection";
import ProductGrid from "@/components/landing/ProductGrid";
import VideoPlayer from "@/components/landing/VideoPlayer";
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Starting data initialization...');
        await fetchProducts();
        
        if (user) {
          console.log('User found, fetching user-specific data...');
          await Promise.all([
            fetchCartItems(),
            fetchUserProfile()
          ]);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        toast.error('Failed to load application data');
      } finally {
        console.log('Data initialization complete, setting loading to false');
        setLoading(false);
      }
    };

    initializeData();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching user profile for:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log('User profile fetched:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const allProducts = data || [];
      console.log('Products fetched:', allProducts.length, 'products');
      setProducts(allProducts);
      setFeaturedProducts(allProducts.filter(product => product.is_featured));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      // Set empty arrays to prevent UI issues
      setProducts([]);
      setFeaturedProducts([]);
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching cart items for user:', user.id);
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        throw error;
      }
      
      console.log('Cart items fetched:', data);
      setCartItems(data?.map(item => item.product_id) || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      // Don't show error toast for cart items as it's not critical
      setCartItems([]);
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.info('Please sign in to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
        toast.success('Item quantity updated in cart!');
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1
          });

        if (insertError) throw insertError;
        
        setCartItems([...cartItems, productId]);
        toast.success('Item added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      toast.success('Removed from wishlist');
    } else {
      setWishlist([...wishlist, productId]);
      toast.success('Added to wishlist');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleShopNow = () => {
    const productsSection = document.getElementById('featured-products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    console.log('Still loading, showing skeleton...');
    return <LoadingSkeleton />;
  }

  console.log('Rendering main content...');
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

      <HeroSection
        user={user}
        onShopNow={handleShopNow}
      />

      <VideoPlayer />

      {/* Featured Snacks Section */}
      {featuredProducts.length > 0 && (
        <section className="py-16 px-4" id="featured-products">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-theme-primary mb-4">Featured Snacks</h3>
              <p className="text-xl text-gray-600">Our handpicked favorites</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ProductGrid
                products={featuredProducts}
                searchQuery=""
                cartItems={cartItems}
                wishlist={wishlist}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
              />
            </div>
          </div>
        </section>
      )}

      {/* All Snacks Section */}
      <section className="py-16 px-4" id="products-section">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-theme-primary mb-4">All Snacks</h3>
            <p className="text-xl text-gray-600">Browse our complete collection</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ProductGrid
              products={products}
              searchQuery={searchQuery}
              cartItems={cartItems}
              wishlist={wishlist}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
            />
          </div>
        </div>
      </section>

      <FeaturesSection />

      <Footer />
    </div>
  );
};

export default Index;
