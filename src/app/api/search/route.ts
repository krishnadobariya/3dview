import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`);

    if (!res.ok) {
      throw new Error(`Geocoding API responded with status: ${res.status}`);
    }

    const data = await res.json();
    
    // Map GeoJSON back to the legacy Nominatim format expected by the frontend
    const results = (data.features || []).map((feature: any) => ({
      lat: feature.geometry.coordinates[1].toString(),
      lon: feature.geometry.coordinates[0].toString(),
      display_name: feature.properties.name
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Geocoding API proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch geocoding data' }, { status: 500 });
  }
}
