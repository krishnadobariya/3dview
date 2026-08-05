export interface ElevationData {
  heights: Float32Array;
  width: number;
  height: number;
  minElevation: number;
  maxElevation: number;
  mapTextureUrl: string;
}

// Helper to calculate pixel coordinates at a given zoom level
function lngLatToPixel(lng: number, lat: number, zoom: number) {
  const scale = Math.pow(2, zoom) * 256;
  const x = (lng + 180) / 360 * scale;
  const latRad = lat * Math.PI / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * scale;
  return { x, y };
}

// Load a single image tile
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load tile: ${url}`));
    img.src = url;
  });
}

// Stitches tiles for a specific bounds and zoom level, returns a canvas
async function stitchTiles(
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number,
  urlTemplate: (z: number, x: number, y: number) => string
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; width: number; height: number }> {
  const nw = lngLatToPixel(bounds.west, bounds.north, zoom);
  const se = lngLatToPixel(bounds.east, bounds.south, zoom);
  
  const cropWidth = Math.max(1, Math.floor(se.x - nw.x));
  const cropHeight = Math.max(1, Math.floor(se.y - nw.y));
  
  const minX = Math.floor(nw.x / 256);
  const maxX = Math.floor(se.x / 256);
  const minY = Math.floor(nw.y / 256);
  const maxY = Math.floor(se.y / 256);
  
  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get 2D context");

  const tilePromises: Promise<void>[] = [];

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const url = urlTemplate(zoom, x, y);
      tilePromises.push(
        loadImage(url).then(img => {
          const drawX = Math.round(x * 256 - nw.x);
          const drawY = Math.round(y * 256 - nw.y);
          ctx.drawImage(img, drawX, drawY, 256, 256);
        }).catch(err => {
          console.warn(`Tile failed to load, skipping: ${url}`, err);
        })
      );
    }
  }

  await Promise.all(tilePromises);
  return { canvas, ctx, width: cropWidth, height: cropHeight };
}

export async function fetchElevationForBounds(
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number = 12 // Default zoom, ignored, we compute our own optimal zooms
): Promise<ElevationData> {
  // Use zoom 11 or 12 for elevation (creates a mesh around 150-300 vertices wide, optimal for WebGL)
  const elevationZoom = 12;
  // Use zoom 14 or 15 for texture (creates a very sharp high-res texture)
  const textureZoom = 14;

  const terrariumTemplate = (z: number, x: number, y: number) => 
    `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
  
  const satelliteTemplate = (z: number, x: number, y: number) => 
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

  // Fetch and stitch both concurrently
  const [elevationResult, textureResult] = await Promise.all([
    stitchTiles(bounds, elevationZoom, terrariumTemplate),
    stitchTiles(bounds, textureZoom, satelliteTemplate)
  ]);

  // Process elevation data
  const { ctx, width, height } = elevationResult;
  const imageData = ctx.getImageData(0, 0, width, height).data;
  
  const heights = new Float32Array(width * height);
  let minElevation = Infinity;
  let maxElevation = -Infinity;

  for (let i = 0; i < width * height; i++) {
    const r = imageData[i * 4];
    const g = imageData[i * 4 + 1];
    const b = imageData[i * 4 + 2];
    
    // Terrarium formula
    let elevation = (r * 256 + g + b / 256) - 32768;
    
    // If it's pure black (failed tile or ocean), set to 0
    if (r === 0 && g === 0 && b === 0) elevation = 0;
    
    heights[i] = elevation;
    if (elevation < minElevation) minElevation = elevation;
    if (elevation > maxElevation) maxElevation = elevation;
  }

  // Generate a high-res base64 data URL for the texture
  const mapTextureUrl = textureResult.canvas.toDataURL('image/jpeg', 0.85);

  return {
    heights,
    width,
    height,
    minElevation,
    maxElevation,
    mapTextureUrl
  };
}
