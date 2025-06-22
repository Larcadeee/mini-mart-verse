
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from '@supabase/supabase-js';

interface HeroSectionProps {
  user: SupabaseUser | null;
  onShopNow: () => void;
}

const HeroSection = ({ user, onShopNow }: HeroSectionProps) => {
  const navigate = useNavigate();
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-r from-theme-primary to-orange-400" />
        <div className="absolute inset-0 bg-gradient-to-r from-theme-primary/70 to-orange-400/70"></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-5xl font-bold text-white mb-6">
          Quick Order
          <span className="text-orange-200"> Snacks</span>
        </h2>
        <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
          No time to shop? Satisfy your cravings in a click — order now and pick your favorites!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            onClick={onShopNow}
            className="bg-white text-theme-primary hover:bg-orange-50 px-8 py-3 text-lg shadow-lg"
          >
            Shop Now
          </Button>
          {!user && (
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-theme-primary px-8 py-3 text-lg bg-white/10 backdrop-blur-sm"
              onClick={() => navigate('/auth')}
            >
              Create Account
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
