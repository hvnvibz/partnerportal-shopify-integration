# Shopify-Supabase Integration Setup

Diese Anleitung erklärt, wie Sie die Shopify-Supabase Integration einrichten.

## Überblick

Die Integration ermöglicht:
- Automatische Erstellung von Shopify-Kundenkonten bei der Registrierung
- Vorausgefüllte Kundendaten beim Checkout (ohne Shopify Plus)
- Bidirektionale Synchronisation der Kundendaten
- Anzeige der Bestellhistorie im Partnerportal

## Wichtiger Hinweis: Shopify Plus vs. Standard Plan

**Shopify Plus erforderlich für:**
- Multipass SSO (automatisches Login)
- Erweiterte Customer Account API Features

**Standard Plan (Basic/Shopify/Advanced) unterstützt:**
- Customer Data Pre-fill beim Checkout
- Admin API für Kundensynchronisation
- Webhook-basierte Synchronisation

## 1. Shopify Admin API Setup

### Schritt 1: Custom App erstellen
1. Gehen Sie zu Ihrem Shopify Admin Panel
2. Navigieren Sie zu **Apps > Entwickler-Apps > Eine App erstellen**
3. Benennen Sie die App (z.B. "Partnerportal Integration")
4. Nach der Erstellung gehen Sie zu **API-Einstellungen**

### Schritt 2: Admin API Berechtigungen
Wählen Sie folgende Berechtigungen:
- `read_customers` - Kunden lesen
- `write_customers` - Kunden erstellen/aktualisieren
- `read_orders` - Bestellungen lesen
- `read_customer_tags` - Kundentags lesen

### Schritt 3: Access Token kopieren
1. Kopieren Sie den **Admin API Access Token**
2. Fügen Sie ihn zu Ihrer `.env.local` hinzu:
```
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
```

## 2. Customer Data Pre-fill Setup (Standard Plan)

### Schritt 1: Checkout-Einstellungen
1. Gehen Sie zu **Einstellungen > Checkout**
2. Scrollen Sie zu **Kundenkonten**
3. Aktivieren Sie **Kundenkonten** (falls noch nicht aktiviert)

### Schritt 2: Customer Account API (Optional)
Für erweiterte Features können Sie die Customer Account API aktivieren:
1. Gehen Sie zu **Einstellungen > Kundenkonten**
2. Aktivieren Sie **Customer Account API**
3. Kopieren Sie **Client ID** und **Client Secret**

### Schritt 3: Environment Variables (Optional)
Fügen Sie diese zu Ihrer `.env.local` hinzu (nur wenn Customer Account API aktiviert):
```
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=your-client-id
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=your-client-secret
```

**Hinweis:** Diese Variablen sind optional. Die Basis-Integration funktioniert auch ohne sie.

## 3. Shopify Webhooks Setup

### Schritt 1: Webhook erstellen
1. Gehen Sie zu **Einstellungen > Benachrichtigungen**
2. Scrollen Sie zu **Webhooks**
3. Klicken Sie auf **Webhook erstellen**

### Schritt 2: Webhook konfigurieren
- **URL**: `https://your-domain.com/api/webhooks/shopify`
- **Format**: JSON
- **Events**: 
  - `customers/create`
  - `customers/update`
  - `customers/delete`

### Schritt 3: Webhook Secret kopieren
1. Kopieren Sie das **Webhook Secret**
2. Fügen Sie es zu Ihrer `.env.local` hinzu:
```
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret
```

## 4. Supabase Schema Setup

### Schritt 1: SQL Schema ausführen
Führen Sie das SQL-Schema aus der Datei `supabase-customer-sync-schema.sql` in Ihrem Supabase Dashboard aus:

1. Gehen Sie zu **SQL Editor**
2. Kopieren Sie den Inhalt der Datei
3. Führen Sie das SQL aus

### Schritt 2: RLS Policies überprüfen
Stellen Sie sicher, dass die Row Level Security Policies korrekt eingerichtet sind.

## 5. Environment Variables

Fügen Sie folgende Variablen zu Ihrer `.env.local` hinzu:

```bash
# Shopify Admin API (erforderlich)
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx

# Shopify Webhooks (erforderlich)
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# Shopify Customer Account API (optional)
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=your-client-id
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=your-client-secret
```

## 6. Testing

### Registrierung testen
1. Registrieren Sie einen neuen Benutzer
2. Überprüfen Sie, ob ein Shopify-Kundenkonto erstellt wurde
3. Überprüfen Sie die Supabase `profiles` Tabelle

### Checkout testen
1. Melden Sie sich im Partnerportal an
2. Fügen Sie Produkte zum Warenkorb hinzu
3. Klicken Sie auf "Zur Kasse"
4. Überprüfen Sie, ob Ihre Kundendaten vorausgefüllt sind

### Synchronisation testen
1. Gehen Sie zu **Einstellungen** im Partnerportal
2. Klicken Sie auf "Synchronisieren"
3. Überprüfen Sie, ob die Daten aktualisiert werden

## 7. Troubleshooting

### Häufige Probleme

**Customer Data Pre-fill funktioniert nicht:**
- Überprüfen Sie, ob Kundenkonten aktiviert sind
- Stellen Sie sicher, dass die Admin API korrekt konfiguriert ist
- Überprüfen Sie die Shopify Store Domain

**Webhooks funktionieren nicht:**
- Überprüfen Sie die Webhook URL
- Stellen Sie sicher, dass HTTPS verwendet wird
- Überprüfen Sie das Webhook Secret

**Admin API Fehler:**
- Überprüfen Sie den Access Token
- Stellen Sie sicher, dass die Berechtigungen korrekt sind
- Überprüfen Sie die Store Domain

### Logs überprüfen
- Browser Console für Frontend-Fehler
- Server Logs für API-Fehler
- Supabase Logs für Datenbankfehler

## 8. Produktions-Deployment

### Sicherheitshinweise
- Verwenden Sie HTTPS für alle Webhook-URLs
- Speichern Sie Secrets sicher
- Überwachen Sie die API-Nutzung
- Implementieren Sie Rate Limiting

### Monitoring
- Überwachen Sie Webhook-Delivery
- Überprüfen Sie Sync-Status regelmäßig
- Überwachen Sie API-Quotas

## 9. Support

Bei Problemen:
1. Überprüfen Sie die Logs
2. Testen Sie in der Entwicklungsumgebung
3. Kontaktieren Sie den Support mit detaillierten Fehlermeldungen

## 10. Zukünftige Erweiterungen

Mögliche Erweiterungen:
- Automatische Bestellstatus-Updates
- Erweiterte Kundensegmentierung
- Integration mit weiteren Shopify-Features
- Mobile App Integration
- Upgrade auf Shopify Plus für Multipass SSO

## 11. Unterschiede: Standard Plan vs. Shopify Plus

### Standard Plan (Basic/Shopify/Advanced)
- ✅ Customer Data Pre-fill beim Checkout
- ✅ Admin API für Kundensynchronisation
- ✅ Webhook-basierte Synchronisation
- ❌ Kein automatisches Login (Multipass)
- ❌ Begrenzte Customer Account API Features

### Shopify Plus
- ✅ Alle Standard Plan Features
- ✅ Multipass SSO (automatisches Login)
- ✅ Erweiterte Customer Account API
- ✅ Erweiterte Webhook-Features
- ✅ Custom Checkout-Erweiterungen
