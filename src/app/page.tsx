import { MapSelector } from '@/components/MapSelector';
import { ConfigOptions } from '@/components/ConfigOptions';
import { DynamicGallery } from '@/components/DynamicGallery';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f5] font-sans">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: Gallery / Dynamic 3D Image */}
          <div className="w-full flex flex-col gap-4">
            <DynamicGallery />
          </div>

          {/* Right Column: Configuration & Map */}
          <div className="w-full flex flex-col">
            <ConfigOptions />
            
            <div className="mt-8 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select a region</h2>
              <p className="text-sm text-gray-500 mt-1">
                The map view is only for selection. Your model uses separate, up-to-date 3D data.
              </p>
            </div>
            
            <div className="h-[500px] w-full rounded-xl overflow-hidden relative border border-gray-200 shadow-sm">
              <MapSelector />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
