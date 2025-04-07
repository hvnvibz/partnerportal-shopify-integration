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
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  }[columns]

  // Dedupliziere Produkte anhand ihrer ID
  const uniqueProducts = [...new Map(products.map(product => [product.id, product])).values()];

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {uniqueProducts.map((product) => (
        <Link
          href={`/shop/${product.handle}`}
          key={product.id}
          className="group bg-white relative flex flex-col overflow-hidden rounded-md border shadow-sm hover:shadow-md transition-shadow"
        >
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
            
            {product.compareAtPrice && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded">
                {Math.round((1 - Number(product.price.amount) / Number(product.compareAtPrice.amount)) * 100)}% Wiederverkaufsrabatt
              </div>
            )}
          </div>
          
          <div className="flex flex-col p-4">
            <h3 className="font-semibold text-sm md:text-base line-clamp-2">{product.title}</h3>
            <div className="mt-2 text-sm">
              {product.compareAtPrice ? (
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">{formatPrice(product.price.amount)}</span>
                  <span className="text-gray-500 line-through text-xs">
                    {formatPrice(product.compareAtPrice.amount)}
                  </span>
                </div>
              ) : (
                <span className="font-semibold">{formatPrice(product.price.amount)}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

