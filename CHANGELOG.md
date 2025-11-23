# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Geplant
- Weitere Features und Verbesserungen

---

## [0.9.0] - 2025-11-12

### Hinzugefügt ✨
- **Admin-Dashboard**: Vollständiges Admin-System mit Benutzerverwaltung
  - Admin kann Display-Namen von Benutzern ändern
  - Kundennummer-Spalte im Admin-Dashboard
  - Sidebar zur Admin-Seite hinzugefügt
  - Benutzer-Rollen und Status-System implementiert
- **Sicherheit**: hCAPTCHA Integration
  - hCAPTCHA für Anmeldung, Registrierung und Passwort-Reset
  - Verbesserte Bot-Schutz-Mechanismen
- **Shopify-Integration**: Erweiterte Funktionalitäten
  - Shopify-Supabase Integration mit Customer Data Pre-fill
  - Admin-Tool zum Verknüpfen bestehender Kunden
  - Verbesserte Fehlerbehandlung in link-customer API

### Geändert 🔄
- **Anmelde- und Registrierungsseite**: 
  - Fehlermeldungen angepasst
  - Layout verbessert
  - Formularfelder optimiert
- **Admin-Dashboard**:
  - Spaltenbezeichnung 'Name' zu 'Displayname' geändert
  - Sidebar-Footer Styling optimiert
- **Session-Management**:
  - Session wird jetzt clientseitig nach Login gesetzt
  - Vollständiger Page-Reload nach Login
  - Session-Refresh nach erfolgreichem Login

### Behoben 🐛
- **Authentifizierung**:
  - Status-Normalisierung im useUser Hook
  - hCAPTCHA Token wird korrekt an Supabase weitergegeben
  - Admin-Seite Weiterleitung - Warte auf Role-Loading
  - Registrierungsseite ist jetzt öffentlich zugänglich
- **Sicherheit**:
  - Infinite Recursion in RLS Policies behoben
  - RLS Policy für Status-Zugriff verbessert
  - Verbesserte Fehlerbehandlung für Role-Loading
  - Supabase Admin-Client für Profil-Updates verwendet
- **Debugging**:
  - Erweiterte Logging für ProtectedRoute
  - Erweiterte Fehlerbehandlung und Logging für Login-Status-Check

---

## [0.8.x] - Oktober 2025

### Hinzugefügt ✨
- **Shop-Funktionalitäten**:
  - Tri-State Preis-Sichtbarkeit Dropdown (all/list/hidden)
  - Produkte mit `hide_product_grid` Metafield werden aus Grid und Suche ausgeblendet
  - Varianten-Dropdown in Cross-Selling-Sektion
  - Produktbild-Zoom-Funktionalität
- **ChatKit Integration**:
  - ChatKit API Route hinzugefügt
  - `/agent-test` Seite implementiert
  - Erweiterte Chat-UI mit 720px Breite und 30% erhöhter Höhe
- **Diagnostics**:
  - `/api/diagnostics/shopify` Endpoint für maskierte Env-Variablen und Ping
  - Storefront API standardmäßig auf versionierten Endpoint gesetzt

### Geändert 🔄
- **Preisausblendung**:
  - Deaktivierung aller interaktiven Controls für Upsell/Cross-Sell wenn Preise versteckt
  - Discount-Badge und Upsell/Cross-Sell Preise werden ausgeblendet wenn 'Preise ausblenden' aktiv
  - Add-to-Cart für Upsell und Cross-Sell blockiert wenn Preise versteckt
- **Checkout**:
  - Verbesserte Fehlerbehandlung und Debug-Logs
  - Runtime Config Logs hinzugefügt
  - URL-Personalisierung rückgängig gemacht
- **Styling**:
  - Agent-Test Seite: Zentrierte Chat-UI und grauer Hintergrund entfernt
  - Agent-Test Seite: Hellgrauer Seitenhintergrund und Sidebar-Layout

### Behoben 🐛
- **Checkout**:
  - ReferenceError durch Deklaration von `safeNote` vor Verwendung behoben
  - Fehlende Schritte und Fehler werden jetzt an Client weitergegeben (temporär)
- **Supabase Integration**:
  - Supabase Admin API durch direkte Datenbankoperationen ersetzt
  - Korrekte Supabase Admin API Syntax verwendet
  - Fallback für fehlende Service Role Key hinzugefügt
  - Sicherheitsprobleme behoben

---

## [0.7.x] - September 2025

### Hinzugefügt ✨
- **Produkthandbücher**:
  - Notion-Datenbank Integration für digitale Produkthandbücher
  - Titelbilder in Produkthandbücher-Übersicht
  - Alphabetische Sortierung für Produkthandbücher
  - Verbesserte Produkthandbuch-Anzeige und Detailseite
  - Horizontal Layout für Produkthandbuch-Karten
  - Desktop Breakpoint mit 3-Spalten-Layout
  - Responsive Breakpoints für Produkthandbuch-Grid optimiert
- **Preisausblendung**:
  - Preisausblendungs-Switch für Shop implementiert
  - Tri-State Preis-Sichtbarkeit System

### Geändert 🔄
- **Produkthandbücher**:
  - Grid von 3 auf 4 Spalten geändert (später wieder auf 3 zurückgesetzt)
  - Produktbeschreibung: Text linksbündig ausgerichtet
  - Schriftgröße reduziert und einzeiliger Text für Produktbeschreibung
  - Bildstyling mit interner Margin und blauem Hintergrund
  - Schatten und Abstände zu Produkthandbuch-Bildern hinzugefügt
  - Produkthandbuch-Kartentitel vereinfacht
  - 'Produktinformationen ansehen' Text unten rechts auf Karten positioniert
  - Konsistente Bildbreite in horizontalen Karten
  - Padding zu Titelbildern für besseren Abstand
- **Warenkorb**:
  - '- Default Title' aus Warenkorb-Produktnamen entfernt
  - Warenkorb wird nach Checkout automatisch geleert

### Behoben 🐛
- **Sicherheit**:
  - Alle Sicherheitslücken behoben
- **Preisausblendung**:
  - Preisausblendungs-Verhalten korrigiert
- **Produkthandbücher**:
  - `generateMetadata` aus Client-Component entfernt
  - 'Produktinformationen ansehen' Text ist jetzt auf Karten sichtbar

---

## [0.6.x] - August 2025

### Hinzugefügt ✨
- **Produktkatalog**:
  - Responsive Design für Produktkatalog

### Geändert 🔄
- **Produktkatalog**:
  - FlipHTML5 URL aktualisiert

---

## [0.5.x] - Juli 2025

### Hinzugefügt ✨
- **Authentifizierung**:
  - Passwort-Reset Funktionalität auf Einstellungsseite
  - Supabase Auth Integration
- **Notion Integration**:
  - Notion API Integration
- **Analytics**:
  - Vercel Analytics Integration

### Geändert 🔄
- **Fehlerbehandlung**:
  - Supabase Login-Fehlermeldungen ins Deutsche übersetzt
  - Verbesserte Fehlerbehandlung für `updateUser` mit Netzwerkfehler-Erkennung
  - Verbesserte Fehlerbehandlung für Passwort-Reset E-Mail
- **Passwort-Reset**:
  - `verifyOtp` für korrekte Passwort-Wiederherstellung Token-Verarbeitung
  - `onAuthStateChange` für korrekte Token-Verarbeitung
  - Token-Validierung entfernt - Passwort-Formular wird sofort angezeigt
  - Unterstützung für beide Token-Formate

### Behoben 🐛
- **React/Next.js**:
  - React-Fehler durch sichere Weiterleitung mit Session-Cleanup behoben
  - `useSearchParams` Suspense Boundary für Next.js 15 Deployment
  - Auth-Session fehlt durch korrekte Access-Token-Verarbeitung behoben
  - Metadata Export entfernt für Client-Component Kompatibilität
- **Passwort-Reset**:
  - Mehrere Bug-Fixes für Passwort-Reset Funktionalität

---

## [0.4.x] - Juni 2025

### Hinzugefügt ✨
- **Shop-Funktionalitäten**:
  - Produktdetailseite
  - Produkt-Upsell Funktionalität
  - Produktgalerie
  - Filterfunktionen
- **DPH Pages**:
  - Einrichtung DPH Pages und Suchfunktionen

### Geändert 🔄
- **Shop**:
  - Collection-Filterung korrigiert
  - Produktdetailseite und weitere Verbesserungen

### Behoben 🐛
- **Filter**:
  - Filter Bug "Alle Produkte" behoben
  - Produktgalerie und Filterfehler behoben

---

## [0.3.x] - Mai 2025

### Hinzugefügt ✨
- **Authentifizierung**:
  - User Auth Routing
  - Supabase Auth Connected

### Geändert 🔄
- **Suche**:
  - Suche zunächst wieder entfernt (Deployment-Fehler)

---

## Versionshistorie

### Version 1.0.3
- Reset Passwort Update Bug Fix

### Version 1.0.2
- Passwort Reset Update

### Version 1.0.1
- Initiale Release-Version

### Version 1.0
- Erste stabile Version

### Version 0.9.7
- Shopify Note Funktionalität

### Version 0.9.6.x
- Mehrere Bug-Fixes und Verbesserungen

### Version 0.9.5
- Weitere Verbesserungen

### Version 0.9.4
- Feature-Updates

### Version 0.9.3
- Bug-Fixes

### Version 0.9.2
- Feature-Updates

### Version 0.9.1.x
- Notion API + Vercel Analytics Integration

---

## Legende

- ✨ **Hinzugefügt**: Neue Features
- 🔄 **Geändert**: Änderungen an bestehenden Features
- 🐛 **Behoben**: Bug-Fixes
- 🔒 **Sicherheit**: Sicherheitsrelevante Änderungen
- 🗑️ **Entfernt**: Entfernte Features
- 📝 **Dokumentation**: Dokumentationsänderungen

---

*Dieser Changelog wird automatisch basierend auf Git-Commits aktualisiert.*

