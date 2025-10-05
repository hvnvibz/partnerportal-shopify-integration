import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Plus, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    setSelectedIds(ids => ids.includes(id) ? ids.filter(pid => pid !== id) : [...ids, id]);
  };

  const setQuantity = (id: string, qty: number) => {
    setQuantities(q => ({ ...q, [id]: Math.max(1, qty) }));
  };

  const selectedProducts = useMemo(() => products.filter(p => selectedIds.includes(p.id)), [products, selectedIds]);
  const totalPrice = selectedProducts.reduce((sum, p) => sum + Number.parseFloat(p.priceRange?.minVariantPrice?.amount || "0") * (quantities[p.id] || 1), 0);

  // Fügt alle ausgewählten Produkte nacheinander in den Warenkorb
  const addAllToCart = async () => {
    setAdding(true);
    let addedCount = 0;
    for (const product of selectedProducts) {
      const qty = quantities[product.id] || 1;
      const success = await addProductToCart(product, qty, toast);
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
            className={`relative min-w-[180px] max-w-[200px] bg-white rounded-lg border p-3 flex flex-col items-center shadow-sm transition-opacity duration-150 ${selectedIds.includes(product.id) ? '' : 'opacity-70'}`}
            style={{ minHeight: 260 }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(product.id)}
              onChange={() => toggleProduct(product.id)}
              className="absolute top-2 right-2 z-10 w-5 h-5 accent-yellow-500"
              aria-label="Produkt auswählen"
            />
            <div className="w-20 h-20 mb-8 relative">
              {product.featuredImage ? (
                <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} fill className="object-contain rounded" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded"><Plus className="text-gray-300 w-8 h-8" /></div>
              )}
            </div>
            <div className="text-xs font-medium text-center mb-1 line-clamp-2 min-h-[2.5em]">{product.title}</div>
            {!hidePrices && (
              <div className="w-full text-center font-bold text-sm mb-2">{Number(product.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
            )}
            {/* Mengen-Auswahl am unteren Rand */}
            <div className="absolute left-0 right-0 bottom-6 flex items-center justify-center gap-2">
              <button
                type="button"
                className="border rounded-md w-7 h-7 flex items-center justify-center text-gray-700 bg-white hover:bg-gray-100"
                onClick={() => setQuantity(product.id, (quantities[product.id] || 1) - 1)}
                disabled={quantities[product.id] <= 1}
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
            disabled={selectedIds.length === 0 || adding}
          >
            Alle {selectedIds.length} in den Warenkorb
          </Button>
        </div>
      </div>
    </div>
  );
} 