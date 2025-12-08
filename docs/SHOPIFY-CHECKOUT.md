# Shopify Checkout Integration

Diese Anwendung ist mit Shopify integriert, um einen nahtlosen Checkout-Prozess zu ermöglichen. Wenn Kunden im Warenkorb auf "Zur Kasse" klicken, werden sie direkt zur Shopify-Checkout-Seite weitergeleitet.

## Konfiguration

1. Benenne die Datei `.env.local.example` in `.env.local` um.
2. Trage deine Shopify-Zugangsdaten in die `.env.local` Datei ein:
   ```
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=dein-shop.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=dein-access-token
   ```

## Zugangsdaten erhalten

Um die erforderlichen Zugangsdaten zu erhalten, musst du folgende Schritte durchführen:

1. Melde dich in deinem Shopify-Admin-Bereich an
2. Gehe zu **Apps > Entwickler-Apps > Eine App erstellen**
3. Benenne die App (z.B. "Headless Storefront")
4. Gehe nach der Erstellung zu **API-Einstellungen**
5. Wähle unter **Storefront API** die erforderlichen Berechtigungen:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_price`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_customer_tags`
6. Kopiere den **Storefront API Access Token** in die `.env.local` Datei

## Funktionsweise

Der Checkout-Prozess umfasst folgende Schritte:

1. Kunde fügt Produkte zum Warenkorb hinzu
2. Kunde klickt auf "Zur Kasse"
3. Die Anwendung sendet einen API-Request an `/api/checkout`
4. Die API erstellt einen neuen Warenkorb in Shopify mit den Artikeln des Kunden
5. Shopify gibt eine Checkout-URL zurück
6. Der Kunde wird zu dieser URL weitergeleitet
7. Der Kunde schließt den Kaufprozess auf der Shopify-Checkout-Seite ab

## Anpassungen

Du kannst die Checkout-Funktionalität nach deinen Bedürfnissen anpassen:

- Rabatt-Codes integrieren
- Hinweise zum Warenkorb hinzufügen
- Warenkorb nach erfolgreicher Weiterleitung leeren

Weitere Informationen findest du in der [Shopify Storefront API Dokumentation](https://shopify.dev/docs/api/storefront). 