
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Button } from "@/components/ui/button";

const VideoPlayer = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const videos = [
    'kpHBxLqkikw',
    'onW7fhueVss', 
    'TT_85PW6OiE'
  ];

  const videoTitles = [
    'Featured Snack 1',
    'Featured Snack 2', 
    'Featured Snack 3'
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
      }, 30000); // Change video every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, videos.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleNext = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-theme-primary mb-4">Featured Snacks</h3>
          <p className="text-xl text-gray-600">Discover our delicious selections</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videos[currentVideoIndex]}?autoplay=${isPlaying ? 1 : 0}&mute=1&loop=1&playlist=${videos[currentVideoIndex]}`}
              title={videoTitles[currentVideoIndex]}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          
          <div className="flex items-center justify-center space-x-4 mt-6">
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="sm"
              className="border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handlePlayPause}
              variant="outline"
              size="sm"
              className="border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={handleNext}
              variant="outline"
              size="sm"
              className="border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <h4 className="text-lg font-semibold text-theme-primary">
              {videoTitles[currentVideoIndex]}
            </h4>
            <p className="text-sm text-gray-600">
              Video {currentVideoIndex + 1} of {videos.length}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoPlayer;
