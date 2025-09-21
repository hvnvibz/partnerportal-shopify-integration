import { NextResponse } from 'next/server';
import { getDatabase, mapHandbook } from '@/lib/notion';

// Cache für bessere Performance
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten
let cache: { data: any[] | null; timestamp: number } = { data: null, timestamp: 0 };

export async function GET() {
  // Hier müssen Sie die Database-ID Ihrer neuen Notion-Datenbank für Produkthandbücher eintragen
  const databaseId = process.env.NOTION_HANDBOOK_DATABASE_ID || '275c919d7cab80d18322dc23768d1097';
  
  try {
    const now = Date.now();
    
    // Cache prüfen
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      console.log(`Handbooks served from cache: ${cache.data.length} items`);
      return NextResponse.json(cache.data);
    }
    
    // Daten aus Notion laden
    console.log('Loading handbooks from Notion...');
    const pages = await getDatabase(databaseId);
    const handbooks = pages.map(mapHandbook);
    
    // Cache aktualisieren
    cache = { data: handbooks, timestamp: now };
    
    console.log(`Handbooks loaded: ${handbooks.length} items`);
    return NextResponse.json(handbooks);
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    console.error('Error loading handbooks:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
