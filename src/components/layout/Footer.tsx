
import { ShoppingCart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <h5 className="text-xl font-bold">MiniMart Online</h5>
          </div>
          <p className="text-gray-400 mb-4">Your Snack Destination</p>
          <p className="text-sm text-gray-500">
            © 2025 MiniMart Online by Gerard.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
