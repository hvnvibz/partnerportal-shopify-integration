import type { Product } from "@/types"
import { ProductUpsellAddButton } from "@/components/shop/product-upsell-item"
import { useState } from "react"

interface ProductUpsellProps {
  products: Product[]
  mainProductId: string
}

export default function ProductUpsell({ products, mainProductId }: ProductUpsellProps) {
  // Trenne die Produkte nach Metafeld (angenommen: die ersten beiden sind aus upselling_1a, der Rest sind "normale" Upsells)
  const upsell1aProducts = products.slice(0, 2)
  const otherUpsellProducts = products.slice(2)

  // State für Radiobutton-Auswahl und "im Warenkorb"-Status
  const [selectedProductId, setSelectedProductId] = useState(upsell1aProducts[0]?.id || "")
  const [addedProductId, setAddedProductId] = useState<string | null>(null)

  // Handler für Hinzufügen (simuliert, da keine echte Cart-API)
  function handleAdd(product: Product) {
    setAddedProductId(product.id)
    // Hier ggf. echte Cart-Logik aufrufen
  }

  if (!products || products.length === 0) return null

  return (
    <div className="mt-6 border rounded-lg p-6 bg-gray-50">
      {/* ODER-GRUPPE: 2-spaltig, Radiobuttons */}
      {upsell1aProducts.length > 0 && (
        <fieldset
          className={`mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-0 rounded ${addedProductId ? 'opacity-50 pointer-events-none' : ''}`}
          disabled={!!addedProductId}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <legend className="mb-4 font-semibold text-sm text-gray-700 pl-4">Wähle eine Option</legend>
          {upsell1aProducts.map((product, idx) => {
            const isActive = selectedProductId === product.id;
            return (
              <div
                key={product.id}
                className={`flex flex-col items-start border rounded p-4 gap-2 cursor-pointer bg-white transition-colors duration-150 ${isActive ? 'border-[#60a5fa] ring-2 ring-[#60a5fa] text-black' : 'border-gray-300 text-gray-400'}`}
                onClick={() => !addedProductId && setSelectedProductId(product.id)}
                style={{ minHeight: '100px', marginLeft: idx === 0 ? '0.25rem' : 0 }}
              >
                <span className="font-medium text-[0.85rem] break-words max-w-xs">{product.title}</span>
                <div className="flex flex-row items-center justify-between w-full mt-4 gap-2">
                  <span className="font-bold text-[0.85rem] leading-none">
                    {Number(product.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                  {isActive && !addedProductId && (
                    <ProductUpsellAddButton product={product} onAdd={() => setAddedProductId(product.id)} />
                  )}
                  {addedProductId === product.id && (
                    <span className="text-green-600 text-xs font-semibold ml-2">Im Warenkorb</span>
                  )}
                </div>
              </div>
            );
          })}
        </fieldset>
      )}
      {/* NORMALE UPSELLS */}
      <div className="pl-4">
        {otherUpsellProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-4 py-2 border-b last:border-b-0 min-h-[48px]"
          >
            <div className="flex-1 font-medium text-[0.85rem] break-words max-w-xs">{product.title}</div>
            <div className="flex flex-col items-end justify-center min-h-[40px] mr-4">
              <span className="font-bold text-[0.85rem] leading-none">
                {Number(product.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
            </div>
            <ProductUpsellAddButton product={product} />
          </div>
        ))}
      </div>
    </div>
  )
} 