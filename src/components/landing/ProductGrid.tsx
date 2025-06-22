
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Heart } from "lucide-react";

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

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  cartItems: string[];
  wishlist: string[];
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
}

const ProductGrid = ({ 
  products, 
  searchQuery, 
  cartItems, 
  wishlist, 
  onAddToCart, 
  onToggleWishlist 
}: ProductGridProps) => {
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayProducts = searchQuery ? filteredProducts : products;

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {searchQuery ? 'No products found matching your search.' : 'No products available.'}
        </p>
      </div>
    );
  }

  return (
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
                onClick={() => onToggleWishlist(product.id)}
              >
                <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              {product.is_featured && (
                <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
                  Featured
                </Badge>
              )}
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
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0 || cartItems.includes(product.id)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 
               cartItems.includes(product.id) ? 'Added to Cart' : 'Add to Cart'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
