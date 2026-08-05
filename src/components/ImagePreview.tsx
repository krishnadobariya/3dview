"use client";

import { useConfigStore } from '@/store/useConfigStore';
import { useEffect, useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export function ImagePreview() {
  const { bounds, size, frameColor, theme } = useConfigStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Simulate image generation when config changes
  useEffect(() => {
    if (!bounds) return;

    setIsGenerating(true);
    
    // Simulate network delay for "generation"
    const timer = setTimeout(() => {
      // In a real app, you would call your backend API here:
      // const response = await fetch(`/api/generate-terrain?bounds=${JSON.stringify(bounds)}&theme=${theme}&size=${size}`);
      // const data = await response.json();
      // setImageUrl(data.imageUrl);

      // Using a placeholder isometric/3D-looking image for demo purposes
      // The image could change based on the theme
      let mockImage = 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=2000&auto=format&fit=crop'; // mountains
      
      if (theme === 'pastel') mockImage = 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2000&auto=format&fit=crop'; // abstract pastel
      if (theme === 'topographic') mockImage = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop'; // map/topo
      if (theme === 'monochrome') mockImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop'; // space/mono

      setImageUrl(mockImage);
      setIsGenerating(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [bounds, size, theme]);

  return (
    <div className="w-full h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
      {!bounds ? (
        <div className="flex flex-col items-center text-slate-400 p-8 text-center">
          <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Region Selected</h3>
          <p className="text-sm max-w-xs">Use the map to select a region and generate your 3D terrain preview.</p>
        </div>
      ) : isGenerating ? (
        <div className="flex flex-col items-center text-blue-500">
          <Loader2 className="w-12 h-12 mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-slate-700">Generating Terrain...</h3>
          <p className="text-sm text-slate-500">Processing elevation data</p>
        </div>
      ) : imageUrl ? (
        <div className="relative w-full h-full p-8 flex items-center justify-center transition-all duration-500">
          {/* Simulated "Frame" around the generated image */}
          <div 
            className="relative shadow-2xl transition-all duration-500"
            style={{ 
              backgroundColor: frameColor,
              padding: '16px',
              borderRadius: '8px',
              // Dynamic sizing to simulate aspect ratio/size changes
              width: size === 14 ? '60%' : size === 20 ? '75%' : '90%',
              aspectRatio: '1/1'
            }}
          >
            {/* Inner frame / matboard */}
            <div className="w-full h-full bg-white p-2 shadow-inner">
              {/* The generated "3D" image */}
              <div 
                className="w-full h-full bg-cover bg-center rounded-sm shadow-inner"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            </div>
            
            {/* Reflection / Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/0 to-white/20 rounded-lg pointer-events-none" />
          </div>
        </div>
      ) : null}
      
      {/* Settings Summary Badge */}
      {bounds && !isGenerating && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm text-xs font-medium text-slate-600 flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: frameColor }} />
            Frame
          </span>
          <span className="capitalize">{theme} Theme</span>
          <span>{size}x{size} cm</span>
        </div>
      )}
    </div>
  );
}
