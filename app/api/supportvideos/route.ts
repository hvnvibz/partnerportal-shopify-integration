import { NextResponse } from 'next/server';
import { getDatabase, mapVideo } from '@/lib/notion';

export async function GET() {
  const databaseId = '209c919d7cab8006879ef790fc144c7d';
  try {
    const pages = await getDatabase(databaseId);
    const videos = pages.map(mapVideo);
    return NextResponse.json(videos);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 