
import { ShoppingCart, Users, Gift } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Why Choose MiniMart Online?</h3>
          <p className="text-xl text-gray-600">Authentic Filipino flavors delivered to your door</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Authentic Products</h4>
            <p className="text-gray-600">Sourced directly from trusted suppliers to ensure quality and authenticity.</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Secure Shopping</h4>
            <p className="text-gray-600">Safe and secure authentication for all purchases with reliable payment processing.</p>
          </div>
          
          <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Fast Delivery</h4>
            <p className="text-gray-600">Quick and reliable delivery service to get your favorites to you as soon as possible.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
