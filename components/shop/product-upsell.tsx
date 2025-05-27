import { ProductUpsellItem, ProductUpsellAddButton } from "@/components/shop/product-upsell-item"
import type { Product } from "@/types"

interface ProductUpsellProps {
  products: Product[]
  mainProductId: string
}

export function ProductUpsell({ products, mainProductId }: ProductUpsellProps) {
  // Debug: Ausgabe der Produkte und SKUs
  console.log("ProductUpsell - Alle verfügbaren Produkte:", products.map(p => ({
    title: p.title,
    id: p.id,
    isKawkD: p.title.includes("KAWK-D"),
    isInduwa: p.title.includes("INDUWA Connect")
  })));
  
  if (!products || products.length === 0) {
    console.log("ProductUpsell - Keine Produkte gefunden");
    return null;
  }
  
  // Abrufen des aktuellen Produkts (Hauptprodukt)
  const mainProduct = products.find(p => p.id === mainProductId);
  const isMainProductKawkD = mainProduct?.title.includes("KAWK-D") || false;
  
  console.log("ProductUpsell - Hauptprodukt:", {
    title: mainProduct?.title,
    id: mainProduct?.id,
    isKawkD: isMainProductKawkD
  });
  
  // Finde das INDUWA Connect Produkt
  const induwaConnectProduct = products.find(
    product => product.title.includes("INDUWA Connect")
  );
  
  console.log("ProductUpsell - INDUWA Connect Produkt gefunden?", {
    found: !!induwaConnectProduct,
    title: induwaConnectProduct?.title
  });
  
  // KAWK Produkte (aber nicht das Hauptprodukt)
  const kawkProducts = products
    .filter(product => product.id !== mainProductId)
    .filter(product => product.title.includes("KAWK"));
  
  console.log("ProductUpsell - Gefundene KAWK Produkte:", kawkProducts.map(p => ({
    title: p.title,
    id: p.id,
    isKawkD: p.title.includes("KAWK-D")
  })));
  
  // Wähle das passende Upselling-Produkt basierend auf dem Produkttitel
  let displayProduct: Product | null = null;
  
  if (isMainProductKawkD && induwaConnectProduct) {
    // Für KAWK-D Produkte, zeige INDUWA Connect
    displayProduct = induwaConnectProduct;
    console.log("ProductUpsell - Zeige INDUWA Connect als Upsell");
  } else if (kawkProducts.length > 0) {
    // Für andere KAWK Produkte, zeige das erste passende KAWK Produkt
    displayProduct = kawkProducts[0];
    console.log("ProductUpsell - Zeige KAWK Produkt als Upsell:", {
      title: kawkProducts[0].title
    });
  }
  
  // Zeige kein Upselling wenn kein passendes Produkt gefunden wurde
  if (!displayProduct) {
    console.log("ProductUpsell - Kein passendes Produkt für Upselling gefunden");
    return null;
  }

  // Preislogik wie im ProductUpsellItem
  let displayPrice = null;
  if (displayProduct.title.includes("INDUWA Connect")) {
    displayPrice = 182.00;
  } else if (displayProduct.priceRange?.minVariantPrice?.amount) {
    displayPrice = Number(displayProduct.priceRange.minVariantPrice.amount);
  }

  return (
    <div className="mt-6 border rounded-lg p-6 bg-gray-50">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          {displayProduct.featuredImage && (
            <div className="h-16 w-16 flex items-center justify-center rounded-md border bg-[#f8f9fa] overflow-hidden">
              <img src={displayProduct.featuredImage.url} alt={displayProduct.featuredImage.altText || displayProduct.title} width={48} height={48} />
            </div>
          )}
          <div className="font-medium text-sm break-words max-w-xs">{displayProduct.title}</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="font-bold text-base whitespace-nowrap">{displayPrice !== null ? `${displayPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : ''}</div>
          <ProductUpsellAddButton product={displayProduct} />
        </div>
      </div>
    </div>
  )
} 