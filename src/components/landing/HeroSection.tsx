
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
      {/* Video Background with Lazy Loading */}
      <div className="absolute inset-0 z-0">
        {!videoLoaded && (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-orange-500" />
        )}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={() => setVideoLoaded(true)}
          poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjU2M2ViO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmOTczMTY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNncmFkaWVudCkiIC8+Cjwvc3ZnPgo="
        >
          <source src="https://player.vimeo.com/external/371638154.sd.mp4?s=d3e0e0e7c1e1c1e1c1e1c1e1c1e1c1e1&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-orange-500/70"></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-5xl font-bold text-white mb-6">
          Quick Order
          <span className="text-orange-200"> Snacks</span>
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          No time to shop? Satisfy your cravings in a click — order now and pick your favorites!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            onClick={onShopNow}
            className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white px-8 py-3 text-lg shadow-lg"
          >
            Shop Now
          </Button>
          {!user && (
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg bg-white/10 backdrop-blur-sm"
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
