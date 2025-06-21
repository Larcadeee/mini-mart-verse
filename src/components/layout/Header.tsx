
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  full_name: string;
  role: string;
}

interface HeaderProps {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  cartItems: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSignOut: () => void;
}

const Header = ({ user, userProfile, cartItems, searchQuery, setSearchQuery, onSignOut }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-theme-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-theme-primary">
                MiniMart Online
              </h1>
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-primary focus:border-transparent w-64"
              />
            </div>

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Welcome, {userProfile?.full_name || user.email}
                </span>
                {userProfile?.role === 'admin' && (
                  <Button
                    onClick={() => navigate('/admin')}
                    variant="outline"
                    size="sm"
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  onClick={() => navigate('/cart')}
                  className="relative bg-theme-primary hover:bg-theme-primary/90"
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
                  onClick={onSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-theme-primary hover:bg-theme-primary/90"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
