
import { useState, useEffect } from "react";
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
        setLoading(true);
        console.log('Starting data initialization...');
        
        // Fetch products first (this doesn't require auth)
        await fetchProducts();
        
        // If user is logged in, fetch user-specific data
        if (user?.id) {
          console.log('User is logged in, fetching user-specific data for:', user.id);
          await Promise.all([
            fetchCartItems(),
            fetchUserProfile()
          ]);
        } else {
          console.log('No user logged in, skipping user-specific data');
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        toast.error('Failed to load application data');
      } finally {
        setLoading(false);
        console.log('Data initialization complete');
      }
    };

    initializeData();
  }, [user?.id]);

  const fetchUserProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available for profile fetch');
      return;
    }

    try {
      console.log('Fetching user profile for:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        console.log('User profile fetched:', data);
        setUserProfile(data);
      } else {
        console.log('No profile found for user');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from database...');
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const allProducts = data || [];
      console.log('Products fetched successfully:', allProducts.length, 'products');
      setProducts(allProducts);
      
      const featured = allProducts.filter(product => product.is_featured);
      console.log('Featured products:', featured.length);
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      // Set empty arrays as fallback
      setProducts([]);
      setFeaturedProducts([]);
    }
  };

  const fetchCartItems = async () => {
    if (!user?.id) {
      console.log('No user ID available for cart fetch');
      return;
    }

    try {
      console.log('Fetching cart items for user:', user.id);
      const { data, error } = await supabase
        .from("cart_items")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        return;
      }

      const itemIds = data?.map(item => item.product_id) || [];
      console.log('Cart items fetched:', itemIds.length, 'items');
      setCartItems(itemIds);
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
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
      toast.success('Added to wishlist');
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
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        userProfile={userProfile}
        cartItems={cartItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSignOut={handleSignOut}
      />

      <HeroSection user={user} onShopNow={handleShopNow} />

      <VideoPlayer />

      {/* Featured Snacks Section - Toned down colors */}
      {featuredProducts.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50" id="featured-products">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Featured Snacks</h3>
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

      {/* All Snacks Section - Showing ALL products, not just search results */}
      <section className="py-16 px-4 bg-gray-50" id="products-section">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">All Snacks</h3>
            <p className="text-xl text-gray-600">Browse our complete collection</p>
            <p className="text-sm text-gray-500 mt-2">Showing {products.length} products</p>
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
