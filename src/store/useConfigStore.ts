import { create } from 'zustand';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface ConfigState {
  bounds: MapBounds | null;
  size: number;
  frameColor: string;
  theme: string;
  isGenerating: boolean;
  panorama: { horizontal: number; vertical: number; enabled: boolean };
  route: { id: string; name: string; color: string; coordinates: [number, number][] } | null;
  plaque: boolean;
  isRouteModalOpen: boolean;
  
  setBounds: (bounds: MapBounds) => void;
  setSize: (size: number) => void;
  setFrameColor: (color: string) => void;
  setTheme: (theme: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setPanorama: (panorama: Partial<{ horizontal: number; vertical: number; enabled: boolean }>) => void;
  setRoute: (route: { id: string; name: string; color: string; coordinates: [number, number][] } | null) => void;
  setPlaque: (plaque: boolean) => void;
  setIsRouteModalOpen: (isOpen: boolean) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  bounds: null,
  size: 14,
  frameColor: '#2d3748',
  theme: 'granite',
  isGenerating: false,
  panorama: { horizontal: 1, vertical: 1, enabled: false },
  route: null,
  plaque: false,
  isRouteModalOpen: false,

  setBounds: (bounds) => set({ bounds }),
  setSize: (size) => set({ size }),
  setFrameColor: (frameColor) => set({ frameColor }),
  setTheme: (theme) => set({ theme }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setPanorama: (panorama) => set((state) => ({ panorama: { ...state.panorama, ...panorama } })),
  setRoute: (route) => set({ route }),
  setPlaque: (plaque) => set({ plaque }),
  setIsRouteModalOpen: (isRouteModalOpen) => set({ isRouteModalOpen }),
}));
