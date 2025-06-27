import Link from "next/link"
import Image from "next/image"

// Hilfsfunktion zum Formatieren von Preisen
function formatPrice(amount: string | number): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;
  return price.toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  });
}

interface ProductGridProps {
  products: any[]
  columns?: number
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  // Custom Breakpoints: xl = 1350px, 2xl = 1920px (siehe tailwind.config.js)
  const gridClass =
    "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"

  // Dedupliziere Produkte anhand ihrer ID
  const uniqueProducts = [...new Map(products.map(product => [product.id, product])).values()];

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {uniqueProducts.map((product) => (
        <Link
          href={`/shop/${product.handle}`}
          key={product.id}
          className="group bg-white relative flex flex-col h-full overflow-hidden rounded-md border shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Rabatt-Badge jetzt außerhalb des Bildes */}
          {product.compareAtPriceRange && (
            <div className="bg-yellow-400 font-semibold rounded mt-3 mx-3 mb-2 self-start" style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem' }}>
              {Math.round((1 - Number(product.priceRange.minVariantPrice.amount) / Number(product.compareAtPriceRange.minVariantPrice.amount)) * 100)}% Wiederverkaufsrabatt
            </div>
          )}
          <div className="aspect-square relative overflow-hidden bg-white">
            {product.featuredImage ? (
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                className="object-contain transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <span className="text-gray-400">Kein Bild</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col flex-grow p-4">
            <div className="mb-2">
              <h3 className="font-semibold line-clamp-2" style={{ fontSize: '0.8rem' }}>{product.title}</h3>
              {product.sku && (
                <p className="text-xs text-muted-foreground mt-1">
                  Art.-Nr.: {product.sku}
                </p>
              )}
            </div>
            <div className="mt-auto pt-2">
              {product.compareAtPriceRange ? (
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">{formatPrice(product.priceRange.minVariantPrice.amount)}</span>
                  <span className="text-gray-500 line-through text-xs">
                    {formatPrice(product.compareAtPriceRange.minVariantPrice.amount)}
                  </span>
                </div>
              ) : (
                <span className="font-semibold">{formatPrice(product.priceRange.minVariantPrice.amount)}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

