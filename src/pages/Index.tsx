
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Heart, Search, User, BarChart3, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchCartItems();
    }
  }, [user]);

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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredProducts = filteredProducts.filter(product => product.is_featured);
  const displayProducts = searchQuery ? filteredProducts : featuredProducts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  MiniMart Online
                </h1>
                <p className="text-sm text-gray-600">Filipino Snacks & More</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <Link to="/admin">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>

              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                  <Button
                    onClick={() => navigate('/cart')}
                    className="relative bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                    {cartItems.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {cartItems.length}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Authentic Filipino Snacks,
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent"> Delivered Fresh</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover the authentic taste of the Philippines with our curated selection of traditional snacks and delicacies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white px-8 py-3 text-lg">
              Shop Now
            </Button>
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
                onClick={() => navigate('/auth')}
              >
                Create Account
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              {searchQuery ? 'Search Results' : 'Featured Filipino Snacks'}
            </h3>
            <p className="text-lg text-gray-600">
              {searchQuery ? `Found ${displayProducts.length} products` : 'Taste the authentic flavors of the Philippines'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  
                  <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </CardDescription>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">
                      ₱{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white transition-all duration-300"
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Why Choose MiniMart Online?</h3>
            <p className="text-xl text-blue-100">Authentic Filipino flavors delivered to your door</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Authentic Products</h4>
              <p className="text-blue-100">Sourced directly from trusted Filipino suppliers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Secure Shopping</h4>
              <p className="text-blue-100">Safe and secure authentication for all purchases</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Fast Delivery</h4>
              <p className="text-blue-100">Quick delivery to bring Filipino flavors to you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <h5 className="text-xl font-bold">MiniMart Online</h5>
            </div>
            <p className="text-gray-400 mb-4">Your Filipino Snack Destination</p>
            <p className="text-sm text-gray-500">
              © 2024 MiniMart Online. Bringing authentic Filipino flavors to your doorstep.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
