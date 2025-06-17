
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
  };
}

const Cart = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url,
            category
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-lg">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Shop</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                    Your Cart
                  </h1>
                  <p className="text-sm text-gray-600">{getTotalItems()} items</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some delicious Filipino snacks to get started!</p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.products.image_url || ''}
                      alt={item.products.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.products.name}</h3>
                      <Badge variant="secondary" className="mb-2">
                        {item.products.category}
                      </Badge>
                      <p className="text-xl font-bold text-blue-600">
                        ₱{item.products.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(item.id)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Items ({getTotalItems()})</span>
                    <span>₱{getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₱50.00</span>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₱{(getTotalPrice() + 50).toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white py-3"
                    onClick={() => toast.success('Checkout functionality coming soon!')}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
