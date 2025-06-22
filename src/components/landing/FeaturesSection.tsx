
import { ShoppingCart, User, Truck } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-theme-primary to-orange-400">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Why Choose MiniMart Online?</h3>
          <p className="text-xl text-orange-100">Authentic Filipino flavors delivered to your door</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Authentic Products</h4>
            <p className="text-orange-100">Sourced directly from trusted suppliers</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Secure Shopping</h4>
            <p className="text-orange-100">Safe and secure authentication for all purchases</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Fast Delivery</h4>
            <p className="text-orange-100">Quick delivery to your doorstep</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
