# Notion-Datenbank Setup für Produkthandbücher

## Übersicht
Diese Anleitung beschreibt, wie Sie eine neue Notion-Datenbank für die Produkthandbücher einrichten und mit dem Partnerportal verknüpfen.

## Notion-Datenbank Struktur

### Aktuelle Eigenschaften in Ihrer Datenbank

| Eigenschaftsname | Typ | Beschreibung | Status |
|------------------|-----|--------------|--------|
| **Aa Kurz-Bezeichnung** | Title | Der Name des Produkthandbuchs | ✅ Vorhanden |
| **Slug** | Rich Text | URL-freundlicher Name (einzigartig) | ✅ Vorhanden |
| **Files & media** | Files | Dateien und Medien | ✅ Vorhanden |
| **Collection ID** | Rich Text | Sammlungs-ID | ✅ Vorhanden |
| **Locale ID** | Rich Text | Sprach-ID | ✅ Vorhanden |
| **Item ID** | Rich Text | Eindeutige Artikel-ID | ✅ Vorhanden |
| **Archived** | Checkbox | Archiviert-Status | ✅ Vorhanden |
| **Draft** | Checkbox | Entwurf-Status | ✅ Vorhanden |

### Empfohlene zusätzliche Eigenschaften

| Eigenschaftsname | Typ | Beschreibung | Beispiel |
|------------------|-----|--------------|----------|
| **Beschreibung** | Rich Text | Kurze Beschreibung des Produkts | "Professionelle Enthärtungsanlage für..." |
| **Produktkategorie** | Select | Kategorie des Produkts | "Enthärtungsanlagen" |
| **Video URL** | URL | YouTube-Link zum Erklärvideo | "https://youtube.com/watch?v=..." |
| **Handbuch PDF** | URL | Link zum Handbuch-PDF | "https://example.com/handbuch.pdf" |
| **Datenblatt PDF** | URL | Link zum Datenblatt-PDF | "https://example.com/datenblatt.pdf" |
| **Wartung PDF** | URL | Link zur Wartungsinformation | "https://example.com/wartung.pdf" |

### Optionale Eigenschaften

| Eigenschaftsname | Typ | Beschreibung |
|------------------|-----|--------------|
| **Erstellt am** | Date | Datum der Erstellung |
| **Aktualisiert am** | Date | Letzte Aktualisierung |
| **Status** | Select | "Aktiv", "In Bearbeitung", "Archiviert" |

## Setup-Schritte

### 1. Notion-Datenbank erstellen
1. Öffnen Sie Notion
2. Erstellen Sie eine neue Datenbank
3. Fügen Sie alle erforderlichen Eigenschaften hinzu (siehe Tabelle oben)
4. Kopieren Sie die Datenbank-ID aus der URL

### 2. Umgebungsvariablen konfigurieren
Fügen Sie in Ihrer `.env.local` Datei hinzu:

```env
# Bestehende Notion-Konfiguration
NOTION_API_KEY=your_notion_api_key_here

# Neue Datenbank für Produkthandbücher
NOTION_HANDBOOK_DATABASE_ID=your_handbook_database_id_here
```

### 3. API-Route aktualisieren
In der Datei `app/api/produkthandbuecher/route.ts` die Database-ID eintragen:

```typescript
const databaseId = process.env.NOTION_HANDBOOK_DATABASE_ID || 'YOUR_HANDBOOK_DATABASE_ID_HERE';
```

### 4. Notion-Integration testen
1. Starten Sie den Development-Server: `npm run dev`
2. Besuchen Sie `/produkthandbuecher`
3. Überprüfen Sie, ob die Daten korrekt geladen werden

## Datenbank-Beispiel-Einträge

### Beispiel 1: KAWK Enthärtungsanlage
- **Titel**: KAWK Enthärtungsanlage
- **Slug**: kawk-enthaertungsanlage
- **Beschreibung**: Professionelle Enthärtungsanlage für mittlere bis große Wassermengen
- **Produktkategorie**: Enthärtungsanlagen
- **Video URL**: https://youtube.com/watch?v=BbFQwiyGSw
- **Handbuch PDF**: https://example.com/handbuch-kawk.pdf
- **Datenblatt PDF**: https://example.com/datenblatt-kawk.pdf
- **Wartung PDF**: https://example.com/wartung-kawk.pdf

### Beispiel 2: KAWN Nitratreduzierungsanlage
- **Titel**: Nitratreduzierungsanlage Typ KAWN
- **Slug**: nitratreduzierungsanlage-kawn
- **Beschreibung**: Spezialanlage zur Reduzierung von Nitrat im Trinkwasser
- **Produktkategorie**: Nitratreduzierungsanlagen
- **Video URL**: https://youtube.com/watch?v=example123
- **Handbuch PDF**: https://example.com/handbuch-kawn.pdf
- **Datenblatt PDF**: https://example.com/datenblatt-kawn.pdf
- **Wartung PDF**: https://example.com/wartung-kawn.pdf

## Fehlerbehebung

### Häufige Probleme

1. **"Database not found" Fehler**
   - Überprüfen Sie die Database-ID
   - Stellen Sie sicher, dass die Notion-Integration Zugriff auf die Datenbank hat

2. **"Property not found" Fehler**
   - Überprüfen Sie, ob alle erforderlichen Eigenschaften in der Datenbank vorhanden sind
   - Stellen Sie sicher, dass die Eigenschaftsnamen exakt übereinstimmen

3. **Leere Ergebnisse**
   - Überprüfen Sie, ob Einträge in der Datenbank vorhanden sind
   - Stellen Sie sicher, dass die Einträge nicht archiviert sind

### Debugging

Um die API zu testen, können Sie direkt die API-Route aufrufen:
```
http://localhost:3000/api/produkthandbuecher
```

## Erweiterte Funktionen

### Kategoriefilter
Die Übersichtsseite unterstützt bereits die Filterung nach Produktkategorien. Sie können weitere Filter hinzufügen, indem Sie die `mapHandbook` Funktion in `lib/notion.js` erweitern.

### Suchfunktion
Die Suchfunktion durchsucht automatisch Titel, Beschreibung und Produktkategorie.

### PDF-Upload
Für PDF-Dateien können Sie:
1. Dateien direkt in Notion hochladen
2. Externe Links zu PDF-Dateien verwenden
3. Eine separate Datei-Hosting-Lösung integrieren

## Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam oder überprüfen Sie die Notion-API-Dokumentation.
