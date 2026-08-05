"use client";

import { useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMapEvents, Rectangle } from 'react-leaflet';
import { useConfigStore } from '@/store/useConfigStore';
import { Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [46.5, 8.0];

// Helper to calculate lat/lng bounds for a given width/height in km around a center
function calculateGeoBounds(center: L.LatLng, widthKm: number, heightKm: number): L.LatLngBounds {
  const latOffset = (heightKm / 2) / 111.32;
  const lngOffset = (widthKm / 2) / (111.32 * Math.cos(center.lat * (Math.PI / 180)));
  
  return L.latLngBounds(
    [center.lat - latOffset, center.lng - lngOffset],
    [center.lat + latOffset, center.lng + lngOffset]
  );
}

function MapBoundsUpdater({ setMapBounds }: { setMapBounds: (center: L.LatLng) => void }) {
  const map = useMapEvents({
    move: () => {
      setMapBounds(map.getCenter());
    },
    zoom: () => {
      setMapBounds(map.getCenter());
    },
  });

  useEffect(() => {
    setMapBounds(map.getCenter());
  }, [map, setMapBounds]);

  return null;
}

export default function MapComponent() {
  const { panorama, size, setBounds } = useConfigStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<L.LatLng | null>(null);

  // Area calculation: size 14 -> 10km, size 20 -> 15km
  const kmPerTile = size === 14 ? 10 : size === 20 ? 15 : 10;
  
  // Calculate the bounds for the grid cells
  const gridBounds = useMemo(() => {
    if (!mapCenter) return { fullBounds: null, cells: [] };
    
    const totalWidthKm = kmPerTile * panorama.horizontal;
    const totalHeightKm = kmPerTile * panorama.vertical;
    
    // Overall bounding box of the entire selection
    const fullBounds = calculateGeoBounds(mapCenter, totalWidthKm, totalHeightKm);
    
    // Split the bounding box into a grid
    const cells = [];
    const latStep = (fullBounds.getNorth() - fullBounds.getSouth()) / panorama.vertical;
    const lngStep = (fullBounds.getEast() - fullBounds.getWest()) / panorama.horizontal;
    
    for (let row = 0; row < panorama.vertical; row++) {
      for (let col = 0; col < panorama.horizontal; col++) {
        const south = fullBounds.getSouth() + (panorama.vertical - 1 - row) * latStep;
        const north = south + latStep;
        const west = fullBounds.getWest() + col * lngStep;
        const east = west + lngStep;
        
        cells.push(L.latLngBounds([south, west], [north, east]));
      }
    }
    
    return { fullBounds, cells };
  }, [mapCenter, kmPerTile, panorama.horizontal, panorama.vertical]);

  // Update global store with the full bounds when the grid changes
  useEffect(() => {
    if (gridBounds.fullBounds) {
      setBounds({
        south: gridBounds.fullBounds.getSouth(),
        west: gridBounds.fullBounds.getWest(),
        north: gridBounds.fullBounds.getNorth(),
        east: gridBounds.fullBounds.getEast(),
      });
    }
  }, [gridBounds.fullBounds, setBounds]);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (mapInstance) {
            mapInstance.flyTo([lat, lon], 12);
          }
        }
      } catch (err) {
        console.error("Search failed", err);
      }
      setIsSearching(false);
    }
  };

  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    if (mapInstance) {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 250);
      
      mapInstance.on('zoomend', () => {
        setMapZoom(mapInstance.getZoom());
      });
    }
  }, [mapInstance]);

  const handleZoomChange = (newZoom: number) => {
    if (mapInstance) {
      mapInstance.setZoom(newZoom);
      setMapZoom(newZoom);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-4 flex flex-col gap-4">
      <div className="bg-gray-100 rounded-xl flex items-center px-4 py-3">
        <Search className={`w-5 h-5 mr-3 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`} />
        <input 
          type="text" 
          placeholder="Search for a mountain or place" 
          className="w-full outline-none text-gray-800 bg-transparent font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="w-full h-[400px] relative rounded-xl overflow-hidden bg-[#1a1a1a]">
        <MapContainer 
          center={DEFAULT_CENTER} 
          zoom={mapZoom} 
          minZoom={9}
          maxZoom={15}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          ref={setMapInstance}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            noWrap={true}
            bounds={[[-90, -180], [90, 180]]}
          />
          
          <MapBoundsUpdater setMapBounds={setMapCenter} />
          
          {gridBounds.cells && gridBounds.cells.map((cellBounds, i) => (
            <Rectangle 
              key={i} 
              bounds={cellBounds} 
              pathOptions={{ 
                color: '#3b82f6', 
                weight: 2, 
                fillColor: '#3b82f6', 
                fillOpacity: 0.1,
                interactive: false
              }} 
            />
          ))}
        </MapContainer>
      </div>

      <div className="px-2 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900">Zoom</h3>
            <p className="text-xs text-gray-500">Zoom in on your model area.</p>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
            {(mapZoom / 11).toFixed(1)}x
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleZoomChange(Math.max(9, mapZoom - 1))}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-gray-600 shrink-0"
          >
            -
          </button>
          
          <input 
            type="range" 
            min="9" 
            max="15" 
            step="1"
            value={mapZoom}
            onChange={(e) => handleZoomChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
          
          <button 
            onClick={() => handleZoomChange(Math.min(15, mapZoom + 1))}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-gray-600 shrink-0"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
