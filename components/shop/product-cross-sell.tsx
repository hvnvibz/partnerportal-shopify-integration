import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Plus, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/types";
import { addProductToCart } from "@/components/shop/product-upsell-item";
import { useToast } from "@/components/ui/use-toast";

interface ProductCrossSellProps {
  products: Product[];
}

export default function ProductCrossSell({ products }: ProductCrossSellProps) {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>(products.map(p => p.id));
  const [adding, setAdding] = useState(false);
  const [quantities, setQuantities] = useState<{ [id: string]: number }>(() => Object.fromEntries(products.map(p => [p.id, 1])));
  const [hidePrices, setHidePrices] = useState(false);
  
  // State für ausgewählte Varianten
  const [selectedVariants, setSelectedVariants] = useState<{ [productId: string]: string }>(() => {
    const initial: { [productId: string]: string } = {};
    products.forEach(product => {
      // Erste verfügbare Variante als Standard setzen
      const firstAvailableVariant = product.variants.edges.find(edge => edge.node.availableForSale);
      if (firstAvailableVariant) {
        initial[product.id] = firstAvailableVariant.node.id;
      }
    });
    return initial;
  });

  // Preis-Sichtbarkeit laden und auf Änderungen reagieren
  useEffect(() => {
    const savedState = localStorage.getItem("hidePrices");
    if (savedState !== null) setHidePrices(JSON.parse(savedState));
  }, []);
  useEffect(() => {
    const handle = (event: CustomEvent) => setHidePrices(event.detail.hidePrices);
    window.addEventListener("price-visibility-changed", handle as EventListener);
    return () => window.removeEventListener("price-visibility-changed", handle as EventListener);
  }, []);
  
  const toggleProduct = (id: string) => {
    if (hidePrices) return;
    setSelectedIds(ids => ids.includes(id) ? ids.filter(pid => pid !== id) : [...ids, id]);
  };

  const setQuantity = (id: string, qty: number) => {
    if (hidePrices) return;
    setQuantities(q => ({ ...q, [id]: Math.max(1, qty) }));
  };

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
  };

  const selectedProducts = useMemo(() => products.filter(p => selectedIds.includes(p.id)), [products, selectedIds]);
  
  // Preisberechnung basierend auf ausgewählter Variante
  const totalPrice = selectedProducts.reduce((sum, product) => {
    const selectedVariantId = selectedVariants[product.id];
    const selectedVariant = product.variants.edges.find(edge => edge.node.id === selectedVariantId);
    const variantPrice = selectedVariant ? Number.parseFloat(selectedVariant.node.price.amount) : Number.parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
    return sum + variantPrice * (quantities[product.id] || 1);
  }, 0);

  // Fügt alle ausgewählten Produkte nacheinander in den Warenkorb
  const addAllToCart = async () => {
    if (hidePrices) return; // block when prices are hidden
    setAdding(true);
    let addedCount = 0;
    for (const product of selectedProducts) {
      const qty = quantities[product.id] || 1;
      const selectedVariantId = selectedVariants[product.id];
      const success = await addProductToCart(product, qty, toast, selectedVariantId);
      if (success) addedCount++;
      await new Promise(res => setTimeout(res, 200)); // kleine Pause für UX
    }
    if (addedCount > 0) {
      toast({
        title: "Produkte hinzugefügt",
        description: `${addedCount} Produkt${addedCount > 1 ? 'e' : ''} wurden zum Warenkorb hinzugefügt.`,
      });
    }
    setAdding(false);
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-8 border rounded-lg p-6" style={{ backgroundColor: '#FFFCF2' }}>
      <h3 className="font-bold text-2xl text-black mb-8">Wird oft zusammen gekauft</h3>
      <div className="flex items-start gap-10 overflow-x-auto">
        {products.map((product, idx) => (
          <div
            key={product.id}
            className={`relative min-w-[180px] max-w-[200px] bg-white rounded-lg border p-4 flex flex-col items-center shadow-sm transition-opacity duration-150 ${selectedIds.includes(product.id) ? '' : 'opacity-70'}`}
            style={{ minHeight: 280 }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(product.id)}
              onChange={() => toggleProduct(product.id)}
              className="absolute bottom-2 right-2 z-10 w-6 h-6 accent-yellow-500"
              aria-label="Produkt auswählen"
              disabled={hidePrices}
            />
            <div className="text-xs font-medium text-center mb-2 line-clamp-2 min-h-[2.5em]">{product.title}</div>
            
            <div className="w-20 h-20 mb-4 relative">
              {product.featuredImage ? (
                <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} fill className="object-contain rounded" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded"><Plus className="text-gray-300 w-8 h-8" /></div>
              )}
            </div>
            
            {!hidePrices && (
              <div className="w-full text-center font-bold text-sm mb-2">
                {(() => {
                  const selectedVariantId = selectedVariants[product.id];
                  const selectedVariant = product.variants.edges.find(edge => edge.node.id === selectedVariantId);
                  const price = selectedVariant ? Number.parseFloat(selectedVariant.node.price.amount) : Number.parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
                  return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
                })()}
              </div>
            )}
            
            {/* Variant-Dropdown für Produkte mit mehreren Varianten */}
            {product.variants.edges.length > 1 && (
              <div className="w-full mb-6">
                <Select
                  value={selectedVariants[product.id] || ""}
                  onValueChange={(variantId) => handleVariantChange(product.id, variantId)}
                  disabled={hidePrices}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Variante wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.edges
                      .filter(edge => edge.node.availableForSale)
                      .map((edge) => (
                        <SelectItem key={edge.node.id} value={edge.node.id}>
                          {edge.node.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Mengen-Auswahl am unteren Rand */}
            <div className="absolute left-0 right-0 bottom-2 flex items-center justify-center gap-2">
              <button
                type="button"
                className="border rounded-md w-7 h-7 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-100"
                onClick={() => setQuantity(product.id, (quantities[product.id] || 1) - 1)}
                disabled={quantities[product.id] <= 1 || hidePrices}
                aria-label="Menge verringern"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-medium">{quantities[product.id] || 1}</span>
              <button
                type="button"
                className="border rounded-md w-7 h-7 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-100"
                onClick={() => setQuantity(product.id, (quantities[product.id] || 1) + 1)}
                aria-label="Menge erhöhen"
                disabled={hidePrices}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {idx < products.length - 1 && (
              <div className="absolute right-[-32px] top-1/2 -translate-y-1/2 select-none pointer-events-none">
                <span className="text-yellow-500 text-2xl font-bold">+</span>
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-col justify-center items-start ml-8 min-w-[180px]">
          {!hidePrices && (
            <>
              <div className="text-gray-700 text-sm mb-2">Gesamtpreis:</div>
              <div className="text-xl font-bold mb-4">
                {totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </div>
            </>
          )}
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded transition"
            onClick={addAllToCart}
            disabled={selectedIds.length === 0 || adding || hidePrices}
          >
            Alle {selectedIds.length} in den Warenkorb
          </Button>
        </div>
      </div>
    </div>
  );
} 