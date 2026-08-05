"use client";

import { useState } from 'react';
import { ThreePreview } from '@/components/ThreePreview';

export function DynamicGallery() {
  const [activeThumb, setActiveThumb] = useState(0);

  // The first thumbnail represents the dynamic 3D preview.
  // The rest are static example images just like the reference UI.
  const thumbnails = [
    { id: 0, type: 'dynamic', label: 'Dynamic Preview' },
    { id: 1, type: 'static', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=200&auto=format&fit=crop' },
    { id: 2, type: 'static', src: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=200&auto=format&fit=crop' },
    { id: 3, type: 'static', src: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=200&auto=format&fit=crop' },
    { id: 4, type: 'static', src: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=200&auto=format&fit=crop' },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main View Area */}
      <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative">
        {activeThumb === 0 ? (
          // Our dynamic 3D WebGL renderer!
          <div className="w-full h-full">
            <ThreePreview />
          </div>
        ) : (
          // Static fallback image
          <img 
            src={thumbnails.find(t => t.id === activeThumb)?.src} 
            alt="Product example" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Thumbnails Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {thumbnails.map((thumb) => (
          <button
            key={thumb.id}
            onClick={() => setActiveThumb(thumb.id)}
            className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
              activeThumb === thumb.id 
                ? 'border-blue-500 shadow-md scale-105' 
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            {thumb.type === 'dynamic' ? (
              <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold text-center leading-tight">
                Live<br/>3D
              </div>
            ) : (
              <img src={thumb.src} alt="thumbnail" className="w-full h-full object-cover" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
