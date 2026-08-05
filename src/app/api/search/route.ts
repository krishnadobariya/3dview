import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`, {
      headers: {
        'User-Agent': 'MountainModelConfigurator/1.0 (local-dev@example.com)'
      }
    });

    if (!res.ok) {
      throw new Error(`Nominatim API responded with status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding API proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch geocoding data' }, { status: 500 });
  }
}
