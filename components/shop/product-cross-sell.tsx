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
  const [mode, setMode] = useState<"all" | "list" | "hidden">("all");
  
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
    const savedMode = localStorage.getItem("priceVisibility") as "all" | "list" | "hidden" | null;
    if (savedMode === "all" || savedMode === "list" || savedMode === "hidden") setMode(savedMode);
    else {
      const legacy = localStorage.getItem("hidePrices");
      if (legacy !== null) setMode(JSON.parse(legacy) ? "hidden" : "all");
    }
  }, []);
  useEffect(() => {
    const handle = (event: CustomEvent) => {
      if (event.detail && (event.detail.mode === "all" || event.detail.mode === "list" || event.detail.mode === "hidden")) {
        setMode(event.detail.mode);
      } else if (typeof event.detail?.hidePrices === 'boolean') {
        setMode(event.detail.hidePrices ? "hidden" : "all");
      }
    };
    window.addEventListener("price-visibility-changed", handle as EventListener);
    return () => window.removeEventListener("price-visibility-changed", handle as EventListener);
  }, []);
  
  const toggleProduct = (id: string) => {
    if (mode !== 'all') return;
    setSelectedIds(ids => ids.includes(id) ? ids.filter(pid => pid !== id) : [...ids, id]);
  };

  const setQuantity = (id: string, qty: number) => {
    if (mode !== 'all') return;
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
    if (mode !== 'all') return; // block when not all prices
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
    <div className="mt-6 md:mt-8 border rounded-lg p-4 md:p-6" style={{ backgroundColor: '#FFFCF2' }}>
      <h3 className="font-bold text-lg md:text-2xl text-black mb-4 md:mb-8">Wird oft zusammen gekauft</h3>
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-10 md:overflow-x-auto">
        {/* Mobile: Produkte als Liste */}
        <div className="flex flex-col md:hidden gap-3 w-full">
          {products.map((product) => (
            <div
              key={product.id}
              className={`relative bg-white rounded-lg border p-3 flex items-center gap-3 shadow-sm transition-opacity duration-150 ${selectedIds.includes(product.id) ? '' : 'opacity-70'}`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                onChange={() => toggleProduct(product.id)}
                className="w-5 h-5 accent-yellow-500 flex-shrink-0"
                aria-label="Produkt auswählen"
                disabled={mode !== 'all'}
              />
              <div className="w-14 h-14 relative flex-shrink-0">
                {product.featuredImage ? (
                  <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} fill className="object-contain rounded" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded"><Plus className="text-gray-300 w-6 h-6" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium line-clamp-2">{product.title}</div>
                {mode === 'all' && (
                  <div className="text-sm font-bold mt-1">
                    {(() => {
                      const selectedVariantId = selectedVariants[product.id];
                      const selectedVariant = product.variants.edges.find(edge => edge.node.id === selectedVariantId)?.node;
                      const price = selectedVariant ? Number.parseFloat(selectedVariant.price.amount) : Number.parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
                      return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
                    })()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  className="border rounded w-6 h-6 flex items-center justify-center text-gray-700 bg-white"
                  onClick={() => setQuantity(product.id, (quantities[product.id] || 1) - 1)}
                  disabled={quantities[product.id] <= 1 || mode !== 'all'}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-sm font-medium">{quantities[product.id] || 1}</span>
                <button
                  type="button"
                  className="border rounded w-6 h-6 flex items-center justify-center text-gray-700 bg-white"
                  onClick={() => setQuantity(product.id, (quantities[product.id] || 1) + 1)}
                  disabled={mode !== 'all'}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Produkte horizontal */}
        <div className="hidden md:flex items-start gap-10 overflow-x-auto">
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
                disabled={mode !== 'all'}
              />
              <div className="text-xs font-medium text-center mb-2 line-clamp-2 min-h-[2.5em]">{product.title}</div>
              
              <div className="w-20 h-20 mb-4 relative">
                {product.featuredImage ? (
                  <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} fill className="object-contain rounded" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded"><Plus className="text-gray-300 w-8 h-8" /></div>
                )}
              </div>
              
              {mode === 'all' ? (
                <div className="w-full text-center mb-2">
                  {(() => {
                    const selectedVariantId = selectedVariants[product.id];
                    const selectedVariant = product.variants.edges.find(edge => edge.node.id === selectedVariantId)?.node;
                    const price = selectedVariant ? Number.parseFloat(selectedVariant.price.amount) : Number.parseFloat(product.priceRange?.minVariantPrice?.amount || "0");
                    const compare = selectedVariant?.compareAtPrice ? Number.parseFloat(selectedVariant.compareAtPrice.amount) : undefined;
                    const priceStr = price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
                    const compareStr = compare !== undefined ? compare.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €" : undefined;
                    return compare && compare > price ? (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-gray-500 line-through text-xs">{compareStr}</span>
                        <span className="font-bold text-sm">{priceStr}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-sm">{priceStr}</span>
                    );
                  })()}
                </div>
              ) : mode === 'list' ? (
                <div className="w-full text-center font-bold text-sm mb-2">
                  {(() => {
                    const selectedVariantId = selectedVariants[product.id];
                    const selectedVariant = product.variants.edges.find(edge => edge.node.id === selectedVariantId);
                    const compareAt = selectedVariant?.node.compareAtPrice ? Number.parseFloat(selectedVariant.node.compareAtPrice.amount) : (product.compareAtPriceRange ? Number.parseFloat(product.compareAtPriceRange.minVariantPrice.amount) : NaN);
                    return isNaN(compareAt) ? "" : (compareAt.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €");
                  })()}
                </div>
              ) : null}
              
              {product.variants.edges.length > 1 && (
                <div className="w-full mb-6">
                  <Select
                    value={selectedVariants[product.id] || ""}
                    onValueChange={(variantId) => handleVariantChange(product.id, variantId)}
                    disabled={mode !== 'all'}
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
              <div className="absolute left-0 right-0 bottom-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="border rounded-md w-7 h-7 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-100"
                  onClick={() => setQuantity(product.id, (quantities[product.id] || 1) - 1)}
                  disabled={quantities[product.id] <= 1 || mode !== 'all'}
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
                  disabled={mode !== 'all'}
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
        </div>
        {/* Gesamt und Button */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-3 md:ml-8 md:min-w-[180px] mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0">
          {mode === 'all' && (
            <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-0">
              <div className="text-gray-700 text-sm md:mb-2">Gesamtpreis:</div>
              <div className="text-lg md:text-xl font-bold md:mb-4">
                {totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </div>
            </div>
          )}
          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 md:px-6 py-2 rounded transition w-full md:w-auto text-sm md:text-base"
            onClick={addAllToCart}
            disabled={selectedIds.length === 0 || adding || mode !== 'all'}
          >
            Alle {selectedIds.length} in den Warenkorb
          </Button>
        </div>
      </div>
    </div>
  );
} 