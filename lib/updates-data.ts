export interface Update {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  tag?: "Neu" | "Verbessert" | "Behoben";
}

export const updates: Update[] = [
  {
    id: "hcaptcha-security",
    title: "Sicherheit beim Login",
    description: "Beim Anmelden und Registrieren schützt dich jetzt eine Sicherheitsprüfung (hCAPTCHA) vor unerwünschten Zugriffen.",
    image: "/updates/security-login.svg",
    date: "November 2025",
    tag: "Neu"
  },
  {
    id: "price-visibility",
    title: "Preis-Sichtbarkeit",
    description: "Wähle selbst, welche Preise angezeigt werden sollen: Alle Preise, nur Listenpreise oder komplett ausblenden.",
    image: "/updates/price-visibility.svg",
    date: "Oktober 2025",
    tag: "Neu"
  },
  {
    id: "image-zoom",
    title: "Produktbild-Zoom",
    description: "Produktbilder können jetzt vergrößert werden. Einfach auf ein Bild klicken, um es größer anzuzeigen.",
    image: "/updates/image-zoom.svg",
    date: "Oktober 2025",
    tag: "Neu"
  },
  {
    id: "product-handbooks",
    title: "Digitale Produkthandbücher",
    description: "Alle Produkthandbücher sind jetzt digital verfügbar mit übersichtlicher Darstellung und alphabetischer Sortierung.",
    image: "/updates/handbooks.svg",
    date: "September 2025",
    tag: "Neu"
  },
  {
    id: "product-details",
    title: "Neue Produktdetailseiten",
    description: "Ausführliche Produktdetailseiten mit Bildgalerie und empfohlenen Produkten für ein besseres Einkaufserlebnis.",
    image: "/updates/product-details.svg",
    date: "Juni 2025",
    tag: "Verbessert"
  }
];
