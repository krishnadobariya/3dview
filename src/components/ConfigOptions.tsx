"use client";

import { useConfigStore } from '@/store/useConfigStore';
import { Plus, Minus, Route, Award, Image as ImageIcon } from 'lucide-react';

export function ConfigOptions() {
  const { 
    size, setSize,
    panorama, setPanorama,
    route,
    plaque, setPlaque,
    setIsRouteModalOpen
  } = useConfigStore();

  const options = [
    { s: 20, area: 225, price: 89 },
    { s: 14, area: 100, price: 69 }
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {options.map((opt) => (
        <button
          key={opt.s}
          onClick={() => setSize(opt.s)}
          className={`w-full flex items-center p-4 bg-white rounded-xl text-left transition-all border-2 ${
            size === opt.s 
              ? 'border-blue-500 shadow-sm' 
              : 'border-transparent shadow-sm hover:shadow-md'
          }`}
        >
          {/* Small thumbnail inside the option (using an unsplash placeholder representing the model) */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 mr-4 border border-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=200&auto=format&fit=crop" 
              alt="Model thumbnail" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          
          <div className="flex-1">
            <div className="font-bold text-gray-900 text-lg">{opt.s} x {opt.s} cm</div>
            <div className="text-sm text-gray-500">shows {opt.area} km²</div>
          </div>
          
          <div className="font-semibold text-gray-900 text-lg">
            ${opt.price}
          </div>
        </button>
      ))}

      {/* Advanced Features */}
      
      {/* 1. Panorama Card */}
      <div className={`w-full bg-white rounded-xl border-2 transition-all ${panorama.enabled ? 'border-blue-500 shadow-sm' : 'border-transparent shadow-sm'}`}>
        <div className="p-4 flex gap-4">
          <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
            <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-90" alt="Panorama preview" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">Panorama</h3>
            <p className="text-sm text-gray-500 mt-1 leading-snug">
              Our most exclusive format showcases your place as an ensemble of multiple individually framed models for a striking presence on your wall.
            </p>
            <button 
              onClick={() => setPanorama({ enabled: !panorama.enabled })}
              className="mt-3 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold text-sm transition-colors"
            >
              {panorama.enabled ? 'Disable panorama' : 'Enable panorama'}
            </button>
          </div>
        </div>
        
        {panorama.enabled && (
          <div className="border-t border-gray-100 p-4 pt-3 flex justify-around">
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-gray-500 mb-1">Horizontal</span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                <button 
                  onClick={() => setPanorama({ horizontal: Math.max(1, panorama.horizontal - 1) })}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-black"
                ><Minus className="w-4 h-4" /></button>
                <span className="font-bold w-4 text-center">{panorama.horizontal}</span>
                <button 
                  onClick={() => setPanorama({ horizontal: panorama.horizontal + 1 })}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-black"
                ><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-gray-500 mb-1">Vertical</span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-full p-1">
                <button 
                  onClick={() => setPanorama({ vertical: Math.max(1, panorama.vertical - 1) })}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-black"
                ><Minus className="w-4 h-4" /></button>
                <span className="font-bold w-4 text-center">{panorama.vertical}</span>
                <button 
                  onClick={() => setPanorama({ vertical: panorama.vertical + 1 })}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 hover:text-black"
                ><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Route Card */}
      <div className={`w-full bg-white rounded-xl border-2 transition-all p-4 flex gap-4 ${route ? 'border-blue-500 shadow-sm' : 'border-transparent shadow-sm'}`}>
        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
           <img src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-90" alt="Route preview" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Route</h3>
              <span className="font-semibold text-gray-900">+ $59</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Choose your own GPX file or a popular route and display it on your model.
            </p>
          </div>
          <button 
            onClick={() => setIsRouteModalOpen(true)}
            className="mt-3 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold text-sm transition-colors"
          >
            {route ? 'Edit route' : 'Add route'}
          </button>
        </div>
      </div>

      {/* 3. Engraved Plaque Card */}
      <div className={`w-full bg-white rounded-xl border-2 transition-all p-4 flex gap-4 ${plaque ? 'border-blue-500 shadow-sm' : 'border-transparent shadow-sm'}`}>
        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover opacity-90" alt="Plaque preview" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Engraved plaque</h3>
              <span className="font-semibold text-gray-900">+ $19</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Brushed stainless steel look, glossy, with adhesive backing. For attaching to the model.
            </p>
          </div>
          <button 
            onClick={() => setPlaque(!plaque)}
            className="mt-3 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold text-sm transition-colors"
          >
            {plaque ? 'Remove plaque' : 'Add plaque'}
          </button>
        </div>
      </div>

    </div>
  );
}
