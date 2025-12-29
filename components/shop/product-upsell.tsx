import type { Product } from "@/types"
import { ProductUpsellAddButton } from "@/components/shop/product-upsell-item"
import { useEffect, useState } from "react"

interface ProductUpsellProps {
  upsell1aProducts: Product[]
  upsell2aProducts: Product[]
  singleUpsellProduct?: Product | null
  mainProductId: string
}

export default function ProductUpsell({ upsell1aProducts, upsell2aProducts, singleUpsellProduct, mainProductId }: ProductUpsellProps) {
  const [mode, setMode] = useState<"all" | "list" | "hidden">("all")
  // Lade den gespeicherten Zustand beim Mount
  useEffect(() => {
    const savedMode = localStorage.getItem("priceVisibility") as "all" | "list" | "hidden" | null
    if (savedMode === "all" || savedMode === "list" || savedMode === "hidden") {
      setMode(savedMode)
    } else {
      const legacy = localStorage.getItem("hidePrices")
      if (legacy !== null) {
        setMode(JSON.parse(legacy) ? "hidden" : "all")
      }
    }
  }, [])
  // Höre auf Preis-Sichtbarkeits-Änderungen
  useEffect(() => {
    const handlePriceVisibilityChange = (event: CustomEvent) => {
      if (event.detail && (event.detail.mode === "all" || event.detail.mode === "list" || event.detail.mode === "hidden")) {
        setMode(event.detail.mode)
      } else if (typeof event.detail?.hidePrices === 'boolean') {
        setMode(event.detail.hidePrices ? "hidden" : "all")
      }
    }
    window.addEventListener("price-visibility-changed", handlePriceVisibilityChange as EventListener)
    return () => {
      window.removeEventListener("price-visibility-changed", handlePriceVisibilityChange as EventListener)
    }
  }, [])
  // State für Radiobutton-Auswahl und "im Warenkorb"-Status für 1a
  const [selectedProductId1a, setSelectedProductId1a] = useState(upsell1aProducts.length > 0 ? upsell1aProducts[0].id : "")
  const [addedProductId1a, setAddedProductId1a] = useState<string | null>(null)
  // State für Radiobutton-Auswahl und "im Warenkorb"-Status für 2a
  const [selectedProductId2a, setSelectedProductId2a] = useState(upsell2aProducts.length > 0 ? upsell2aProducts[0].id : "")
  const [addedProductId2a, setAddedProductId2a] = useState<string | null>(null)

  if (!upsell1aProducts.length && !upsell2aProducts.length && !singleUpsellProduct) return null

  return (
    <div className="mt-4 md:mt-6 border rounded-lg p-4 md:p-6 bg-gray-50">
      {/* Card-Variante für 1a-Produkte */}
      {upsell1aProducts.length > 0 && (
        <fieldset
          className={`mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-0 rounded ${addedProductId1a ? 'opacity-50 pointer-events-none' : ''} ${mode !== 'all' ? 'opacity-60 pointer-events-none' : ''}`}
          disabled={!!addedProductId1a || mode !== 'all'}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <legend className="mb-3 md:mb-4 font-semibold text-xs md:text-sm text-gray-700 pl-2 md:pl-4">Wähle eine Option</legend>
          {upsell1aProducts.map((product, idx) => {
            const isActive = selectedProductId1a === product.id;
            return (
              <div
                key={product.id}
                className={`flex flex-col items-start border rounded p-3 md:p-4 gap-2 cursor-pointer bg-white transition-colors duration-150 ${isActive ? 'border-[#60a5fa] ring-2 ring-[#60a5fa] text-black' : 'border-gray-300 text-gray-400'}`}
                onClick={() => !addedProductId1a && mode === 'all' && setSelectedProductId1a(product.id)}
                style={{ minHeight: '90px' }}
              >
                <span className="font-medium text-[0.75rem] md:text-[0.85rem] break-words w-full">{product.title}</span>
                <div className="flex flex-row items-center justify-between w-full mt-2 md:mt-4 gap-2" style={{ minHeight: 40 }}>
                  {mode === 'all' ? (
                    <span className="font-bold text-[0.75rem] md:text-[0.8rem] leading-none">
                      {Number(product.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  ) : mode === 'list' ? (
                    singleUpsellProduct?.compareAtPriceRange || product.compareAtPriceRange ? (
                      <span className="font-bold text-[0.75rem] md:text-[0.8rem] leading-none">
                        {Number((product.compareAtPriceRange?.minVariantPrice?.amount || singleUpsellProduct?.compareAtPriceRange?.minVariantPrice?.amount) || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </span>
                    ) : null
                  ) : null}
                  <div className="flex justify-end min-w-[100px] md:min-w-[120px]">
                    {isActive && !addedProductId1a && (
                      <ProductUpsellAddButton disabled={mode !== 'all'} product={product} onAdd={() => setAddedProductId1a(product.id)} buttonTextClassName="text-[0.7em] md:text-[0.8em]" />
                    )}
                    {addedProductId1a === product.id && (
                      <span className="text-green-600 text-[0.65rem] md:text-xs font-semibold ml-2">Im Warenkorb</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </fieldset>
      )}
      {/* Card-Variante für 2a-Produkte */}
      {upsell2aProducts.length > 0 && (
        <fieldset
          className={`mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-0 rounded ${addedProductId2a ? 'opacity-50 pointer-events-none' : ''} ${mode !== 'all' ? 'opacity-60 pointer-events-none' : ''}`}
          disabled={!!addedProductId2a || mode !== 'all'}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <legend className="mb-3 md:mb-4 font-semibold text-xs md:text-sm text-gray-700 pl-2 md:pl-4">Wähle eine Option</legend>
          {upsell2aProducts.map((product, idx) => {
            const isActive = selectedProductId2a === product.id;
            return (
              <div
                key={product.id}
                className={`flex flex-col items-start border rounded p-3 md:p-4 gap-2 cursor-pointer bg-white transition-colors duration-150 ${isActive ? 'border-[#60a5fa] ring-2 ring-[#60a5fa] text-black' : 'border-gray-300 text-gray-400'}`}
                onClick={() => !addedProductId2a && mode === 'all' && setSelectedProductId2a(product.id)}
                style={{ minHeight: '90px' }}
              >
                <span className="font-medium text-[0.75rem] md:text-[0.85rem] break-words w-full">{product.title}</span>
                <div className="flex flex-row items-center justify-between w-full mt-2 md:mt-4 gap-2" style={{ minHeight: 40 }}>
                  {mode === 'all' ? (
                    <span className="font-bold text-[0.75rem] md:text-[0.8rem] leading-none">
                      {Number(product.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  ) : mode === 'list' ? (
                    product.compareAtPriceRange ? (
                      <span className="font-bold text-[0.75rem] md:text-[0.8rem] leading-none">
                        {Number(product.compareAtPriceRange.minVariantPrice.amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </span>
                    ) : null
                  ) : null}
                  <div className="flex justify-end min-w-[100px] md:min-w-[120px]">
                    {isActive && !addedProductId2a && (
                      <ProductUpsellAddButton disabled={mode !== 'all'} product={product} onAdd={() => setAddedProductId2a(product.id)} buttonTextClassName="text-[0.7em] md:text-[0.8em]" />
                    )}
                    {addedProductId2a === product.id && (
                      <span className="text-green-600 text-[0.65rem] md:text-xs font-semibold ml-2">Im Warenkorb</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </fieldset>
      )}
      {/* EINZELNER UPSELL (einzeilige Variante) */}
      {singleUpsellProduct && (
        <div className="pl-2 md:pl-4">
          <div
            key={singleUpsellProduct.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 py-2 border-b last:border-b-0 min-h-[48px]"
          >
            <div className="flex-1 font-medium text-[0.75rem] md:text-[0.85rem] break-words">{singleUpsellProduct.title}</div>
            <div className="flex flex-row items-center gap-2 md:gap-4 min-h-[36px] md:min-h-[40px] mr-0 md:mr-4">
              {mode === 'all' ? (
                <span className="font-bold text-[0.75rem] md:text-[0.8rem] leading-none">
                  {Number(singleUpsellProduct.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              ) : mode === 'list' ? (
                singleUpsellProduct.compareAtPriceRange ? (
                  <span className="font-bold text-[0.75rem] md:text-[0.8rem] leading-none">
                    {Number(singleUpsellProduct.compareAtPriceRange.minVariantPrice.amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                ) : null
              ) : null}
              <ProductUpsellAddButton disabled={mode !== 'all'} product={singleUpsellProduct} buttonTextClassName="text-[0.7em] md:text-[0.8em]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 