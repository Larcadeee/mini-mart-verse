
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
  console.log('ProductGrid received products:', products.length);
  console.log('ProductGrid cartItems:', cartItems);
  console.log('Search query:', searchQuery);

  const filteredProducts = searchQuery.trim() 
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  console.log('Filtered products:', filteredProducts.length);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products available in the database.</p>
        <p className="text-gray-400 text-sm mt-2">Please add some products through the admin panel.</p>
      </div>
    );
  }

  if (filteredProducts.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No products found matching "{searchQuery}".
        </p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchQuery && (
        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const isInCart = cartItems.includes(product.id);
          console.log(`Product ${product.id} (${product.name}) - isInCart:`, isInCart);
          
          return (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
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
                    <Badge className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600">
                      Featured
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
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
                
                <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {product.name}
                </CardTitle>
                
                <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description || 'No description available'}
                </CardDescription>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-800">
                    ₱{Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0">
                <Button
                  className={`w-full transition-all duration-300 ${
                    isInCart 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  }`}
                  onClick={() => onAddToCart(product.id)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 
                   isInCart ? 'Added to Cart' : 'Add to Cart'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
