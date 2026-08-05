"use client";

import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useConfigStore } from '@/store/useConfigStore';
import { fetchElevationForBounds, ElevationData } from '@/utils/elevation';
import { Loader2, X, AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-500 p-4 text-center">
          <AlertCircle className="w-10 h-10 mb-2" />
          <h2 className="font-bold">3D Preview Error</h2>
          <p className="text-sm mt-1">{this.state.error?.message || "Failed to load 3D scene."}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-100 rounded-lg text-sm font-semibold hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function TerrainMesh({ 
  elevationData, 
  theme,
  horizontal = 1,
  vertical = 1,
  frameX = 0,
  frameZ = 0,
}: { 
  elevationData: ElevationData; 
  theme: string;
  horizontal?: number;
  vertical?: number;
  frameX?: number;
  frameZ?: number;
}) {
  const geometry = useMemo(() => {
    // 9.4 width perfectly overlaps the inner 9.2 frame boundary by 0.1 on all sides,
    // completely hiding the seam without needing expensive clipping planes!
    const blockWidth = 9.4;
    const blockDepth = 9.4;
    
    // Calculate vertices for this specific chunk
    const segmentsX = Math.max(2, Math.floor((elevationData.width - 1) / horizontal));
    const segmentsY = Math.max(2, Math.floor((elevationData.height - 1) / vertical));
    
    // Create a solid Box instead of a flat Plane for the CNC block look
    const geometry = new THREE.BoxGeometry(blockWidth, 1, blockDepth, segmentsX, 1, segmentsY);
    
    const positions = geometry.attributes.position.array as Float32Array;
    const scale = 2.0; 
    const baseThickness = 0.5; // Solid block base thickness
    
    const range = elevationData.maxElevation - elevationData.minElevation || 1;
    for (let i = 0; i < positions.length; i += 3) {
      const vx = positions[i];
      const vy = positions[i + 1];
      const vz = positions[i + 2];

      // Convert to 0..1 range inside this block
      let normalizedX = (vx + blockWidth / 2) / blockWidth;
      let normalizedZ = (vz + blockDepth / 2) / blockDepth;
      normalizedX = Math.max(0, Math.min(1, normalizedX));
      normalizedZ = Math.max(0, Math.min(1, normalizedZ));
      
      // Map to global 0..1 range of the full panorama area
      const globalX = (frameX + normalizedX) / horizontal;
      const globalZ = (frameZ + normalizedZ) / vertical;
      
      const imgX = Math.floor(globalX * (elevationData.width - 1));
      const imgY = Math.floor(globalZ * (elevationData.height - 1));
      const zIndex = imgY * elevationData.width + imgX;
      
      const heightVal = elevationData.heights[zIndex] || elevationData.minElevation;
      const normalizedHeight = (heightVal - elevationData.minElevation) / range;
      
      if (vy > 0) { 
        // Top face of the block is displaced to form mountains
        positions[i + 1] = baseThickness + normalizedHeight * scale;
      } else { 
        // Bottom face remains perfectly flat
        positions[i + 1] = 0; 
      }
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, [elevationData, horizontal, vertical, frameX, frameZ]);

  const baseTexture = useTexture(elevationData.mapTextureUrl);
  baseTexture.colorSpace = THREE.SRGBColorSpace;
  
  // Clone and crop the texture to fit this specific frame
  const blockTexture = useMemo(() => {
    const tex = baseTexture.clone();
    tex.repeat.set(1 / horizontal, 1 / vertical);
    tex.offset.set(frameX / horizontal, 1 - (frameZ + 1) / vertical);
    tex.needsUpdate = true;
    return tex;
  }, [baseTexture, horizontal, vertical, frameX, frameZ]);

  return (
    // Position at Y=0.2 so it perfectly rests on top of the PictureFrame's backplate
    <mesh geometry={geometry} position={[0, 0.2, 0]} receiveShadow castShadow>
      <meshStandardMaterial attach="material-0" color="#f8fafc" roughness={0.9} />
      <meshStandardMaterial attach="material-1" color="#f8fafc" roughness={0.9} />
      <meshStandardMaterial attach="material-2" map={blockTexture} roughness={0.9} metalness={0.0} />
      <meshStandardMaterial attach="material-3" color="#f8fafc" roughness={0.9} />
      <meshStandardMaterial attach="material-4" color="#f8fafc" roughness={0.9} />
      <meshStandardMaterial attach="material-5" color="#f8fafc" roughness={0.9} />
    </mesh>
  );
}

function PictureFrame({ frameColor }: { frameColor: string }) {
  const thickness = 0.4;
  const size = 10;
  const height = 0.8;
  const baseThickness = 0.2;

  // Real frame colors mapped from standard colors
  const actualFrameColor = frameColor === 'black' ? '#1a1a1a' : 
                           frameColor === 'white' ? '#f5f5f5' : 
                           frameColor === 'wood' ? '#8b5a2b' : frameColor;

  return (
    <group>
      {/* Base Plane (The backplate inside the frame) - Light blue like the screenshot */}
      <mesh position={[0, -baseThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[size, baseThickness, size]} />
        <meshStandardMaterial color="#91B9C5" roughness={0.9} />
      </mesh>

      {/* Frame Borders */}
      <mesh position={[0, height / 2 - baseThickness, -size / 2 - thickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[size + thickness * 2, height, thickness]} />
        <meshStandardMaterial color={actualFrameColor} roughness={0.3} />
      </mesh>
      
      <mesh position={[0, height / 2 - baseThickness, size / 2 + thickness / 2]} receiveShadow castShadow>
        <boxGeometry args={[size + thickness * 2, height, thickness]} />
        <meshStandardMaterial color={actualFrameColor} roughness={0.3} />
      </mesh>
      
      <mesh position={[-size / 2 - thickness / 2, height / 2 - baseThickness, 0]} receiveShadow castShadow>
        <boxGeometry args={[thickness, height, size]} />
        <meshStandardMaterial color={actualFrameColor} roughness={0.3} />
      </mesh>
      
      <mesh position={[size / 2 + thickness / 2, height / 2 - baseThickness, 0]} receiveShadow castShadow>
        <boxGeometry args={[thickness, height, size]} />
        <meshStandardMaterial color={actualFrameColor} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function ThreePreview() {
  const { bounds, size, frameColor, theme, panorama } = useConfigStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [elevation, setElevation] = useState<ElevationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const horizontal = panorama.enabled ? panorama.horizontal : 1;
  const vertical = panorama.enabled ? panorama.vertical : 1;
  const frameSpacing = 0.5;
  const frameSize = 10;

  useEffect(() => {
    if (!bounds) return;

    let isActive = true;
    setIsGenerating(true);
    setError(null);

    fetchElevationForBounds(bounds)
      .then(data => {
        if (isActive) {
          setElevation(data);
          setIsGenerating(false);
        }
      })
      .catch(err => {
        console.error("Error fetching terrain:", err);
        if (isActive) {
          setError("Failed to fetch terrain data");
          setIsGenerating(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [bounds]);

  return (
    <div className="w-full h-full bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
      {!bounds ? (
        <div className="flex flex-col items-center text-slate-400 p-8 text-center">
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Region Selected</h3>
          <p className="text-sm max-w-xs">Use the map to select a region to generate your 3D terrain.</p>
        </div>
      ) : (
        <div className="w-full h-full relative">
          
          {/* Overlay loading/error states */}
          {isGenerating && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm text-blue-600 transition-all">
              <Loader2 className="w-12 h-12 mb-4 animate-spin" />
              <h3 className="text-lg font-bold">Generating 3D Terrain...</h3>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-red-500">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* WebGL Canvas */}
          <ErrorBoundary>
            <Canvas shadows camera={{ position: [-12, 12, 12], fov: 45 }} gl={{ localClippingEnabled: true }}>
              
              {/* Soft studio lighting */}
              <ambientLight intensity={0.5} />
              <directionalLight 
                position={[10, 15, 10]} 
                intensity={1.5} 
                castShadow 
                shadow-mapSize={2048}
                shadow-bias={-0.0001}
              />
              <directionalLight position={[-10, 10, -10]} intensity={0.5} color="#e0f2fe" />
              
              {/* Environment for reflections */}
              <Environment preset="city" />

              {/* Desk Surface (White table) */}
              <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
              </mesh>

              <group>
                {/* The Dynamic Terrain inside the Panorama Grid */}
                {elevation && (
                  <Suspense fallback={null}>
                    {Array.from({ length: horizontal }).map((_, x) => 
                      Array.from({ length: vertical }).map((_, z) => {
                        // Calculate offset for this specific frame
                        const offsetX = (x - (horizontal - 1) / 2) * (frameSize + frameSpacing);
                        const offsetZ = (z - (vertical - 1) / 2) * (frameSize + frameSpacing);

                        return (
                          <group key={`${x}-${z}`}>
                            <group position={[offsetX, 0, offsetZ]}>
                              <PictureFrame frameColor={frameColor} />
                              <TerrainMesh 
                                elevationData={elevation} 
                                theme={theme} 
                                horizontal={horizontal}
                                vertical={vertical}
                                frameX={x}
                                frameZ={z}
                              />
                            </group>
                          </group>
                        );
                      })
                    )}
                  </Suspense>
                )}

                {/* Realistic Contact Shadows for the frame(s) */}
                <ContactShadows position={[0, -0.19, 0]} opacity={0.6} scale={25} blur={2.0} far={4} color="#000000" />
              </group>

              <OrbitControls 
                enablePan={false}
                minDistance={10}
                maxDistance={40}
                maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going below the desk
              />
            </Canvas>
          </ErrorBoundary>
          
          {/* Configuration Badge overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm text-xs font-medium text-slate-700 flex gap-4 pointer-events-none">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: frameColor }} />
              Frame
            </span>
            <span className="capitalize">{theme} Theme</span>
            <span>{size}x{size} cm Print</span>
          </div>
        </div>
      )}
    </div>
  );
}
