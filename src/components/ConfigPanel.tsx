"use client";

import { useConfigStore } from '@/store/useConfigStore';

export function ConfigPanel() {
  const { size, frameColor, theme, setSize, setFrameColor, setTheme } = useConfigStore();

  const themes = [
    { id: 'granite', name: 'Granite', colors: ['#4b5563', '#9ca3af'] },
    { id: 'pastel', name: 'Pastel', colors: ['#fcd34d', '#f472b6'] },
    { id: 'topographic', name: 'Topographic', colors: ['#10b981', '#3b82f6'] },
    { id: 'monochrome', name: 'Monochrome', colors: ['#171717', '#737373'] },
  ];

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Configuration</h2>
        <p className="text-sm text-slate-500">Customize your 3D terrain print</p>
      </div>

      {/* Size Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Print Size</label>
        <div className="grid grid-cols-3 gap-2">
          {[14, 20, 30].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                size === s 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}x{s} cm
            </button>
          ))}
        </div>
      </div>

      {/* Frame Color Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Frame Color</label>
        <div className="flex gap-3">
          {['#2d3748', '#e2e8f0', '#8b5cf6', '#f43f5e'].map((color) => (
            <button
              key={color}
              onClick={() => setFrameColor(color)}
              className={`w-10 h-10 rounded-full transition-transform duration-200 ${
                frameColor === color ? 'scale-110 ring-2 ring-offset-2 ring-blue-500 shadow-md' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select frame color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700 block">Terrain Theme</label>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                theme === t.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: t.colors[0] }}
                />
                <div 
                  className="w-4 h-4 rounded-full -ml-3" 
                  style={{ backgroundColor: t.colors[1] }}
                />
              </div>
              <span className={`text-sm font-medium ${theme === t.id ? 'text-blue-700' : 'text-slate-700'}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-500 font-medium text-sm">Estimated Price</span>
          <span className="text-2xl font-bold text-slate-800">${size === 14 ? '49' : size === 20 ? '89' : '149'}</span>
        </div>
        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
          Generate Image
        </button>
      </div>
    </div>
  );
}
