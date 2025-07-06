import type { Product } from "@/types"
import { ProductUpsellAddButton } from "@/components/shop/product-upsell-item"
import { useState } from "react"

interface ProductUpsellProps {
  upsell1aProducts: Product[]
  upsell2aProducts: Product[]
  singleUpsellProduct?: Product | null
  mainProductId: string
}

export default function ProductUpsell({ upsell1aProducts, upsell2aProducts, singleUpsellProduct, mainProductId }: ProductUpsellProps) {
  // State für Radiobutton-Auswahl und "im Warenkorb"-Status für 1a
  const [selectedProductId1a, setSelectedProductId1a] = useState(upsell1aProducts.length > 0 ? upsell1aProducts[0].id : "")
  const [addedProductId1a, setAddedProductId1a] = useState<string | null>(null)
  // State für Radiobutton-Auswahl und "im Warenkorb"-Status für 2a
  const [selectedProductId2a, setSelectedProductId2a] = useState(upsell2aProducts.length > 0 ? upsell2aProducts[0].id : "")
  const [addedProductId2a, setAddedProductId2a] = useState<string | null>(null)

  if (!upsell1aProducts.length && !upsell2aProducts.length && !singleUpsellProduct) return null

  return (
    <div className="mt-6 border rounded-lg p-6 bg-gray-50">
      {/* Card-Variante für 1a-Produkte */}
      {upsell1aProducts.length > 0 && (
        <fieldset
          className={`mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-0 rounded ${addedProductId1a ? 'opacity-50 pointer-events-none' : ''}`}
          disabled={!!addedProductId1a}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <legend className="mb-4 font-semibold text-sm text-gray-700 pl-4">Wähle eine Option</legend>
          {upsell1aProducts.map((product, idx) => {
            const isActive = selectedProductId1a === product.id;
            return (
              <div
                key={product.id}
                className={`flex flex-col items-start border rounded p-4 gap-2 cursor-pointer bg-white transition-colors duration-150 ${isActive ? 'border-[#60a5fa] ring-2 ring-[#60a5fa] text-black' : 'border-gray-300 text-gray-400'}`}
                onClick={() => !addedProductId1a && setSelectedProductId1a(product.id)}
                style={{ minHeight: '100px', marginLeft: idx === 0 ? '0.25rem' : 0 }}
              >
                <span className="font-medium text-[0.85rem] break-words max-w-xs">{product.title}</span>
                <div className="flex flex-row items-center justify-between w-full mt-4 gap-2" style={{ minHeight: 44 }}>
                  <span className="font-bold text-[0.8rem] leading-none">
                    {Number(product.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                  <div style={{ minWidth: 120, display: 'flex', justifyContent: 'flex-end' }}>
                    {isActive && !addedProductId1a && (
                      <ProductUpsellAddButton product={product} onAdd={() => setAddedProductId1a(product.id)} buttonTextClassName="text-[0.8em]" />
                    )}
                    {addedProductId1a === product.id && (
                      <span className="text-green-600 text-xs font-semibold ml-2">Im Warenkorb</span>
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
          className={`mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-0 rounded ${addedProductId2a ? 'opacity-50 pointer-events-none' : ''}`}
          disabled={!!addedProductId2a}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <legend className="mb-4 font-semibold text-sm text-gray-700 pl-4">Wähle eine Option</legend>
          {upsell2aProducts.map((product, idx) => {
            const isActive = selectedProductId2a === product.id;
            return (
              <div
                key={product.id}
                className={`flex flex-col items-start border rounded p-4 gap-2 cursor-pointer bg-white transition-colors duration-150 ${isActive ? 'border-[#60a5fa] ring-2 ring-[#60a5fa] text-black' : 'border-gray-300 text-gray-400'}`}
                onClick={() => !addedProductId2a && setSelectedProductId2a(product.id)}
                style={{ minHeight: '100px', marginLeft: idx === 0 ? '0.25rem' : 0 }}
              >
                <span className="font-medium text-[0.85rem] break-words max-w-xs">{product.title}</span>
                <div className="flex flex-row items-center justify-between w-full mt-4 gap-2" style={{ minHeight: 44 }}>
                  <span className="font-bold text-[0.8rem] leading-none">
                    {Number(product.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </span>
                  <div style={{ minWidth: 120, display: 'flex', justifyContent: 'flex-end' }}>
                    {isActive && !addedProductId2a && (
                      <ProductUpsellAddButton product={product} onAdd={() => setAddedProductId2a(product.id)} buttonTextClassName="text-[0.8em]" />
                    )}
                    {addedProductId2a === product.id && (
                      <span className="text-green-600 text-xs font-semibold ml-2">Im Warenkorb</span>
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
        <div className="pl-4">
          <div
            key={singleUpsellProduct.id}
            className="flex flex-row items-center justify-between gap-4 py-2 border-b last:border-b-0 min-h-[48px]"
          >
            <div className="flex-1 font-medium text-[0.85rem] break-words max-w-xs">{singleUpsellProduct.title}</div>
            <div className="flex flex-row items-center gap-4 min-h-[40px] mr-4">
              <span className="font-bold text-[0.8rem] leading-none">
                {Number(singleUpsellProduct.priceRange?.minVariantPrice?.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
              <ProductUpsellAddButton product={singleUpsellProduct} buttonTextClassName="text-[0.8em]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 