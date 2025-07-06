import { ProductGrid } from "@/components/shop/product-grid";
import type { Product } from "@/types";

interface RelatedProductsProps {
  products: Product[];
  columns?: number;
}

export default function RelatedProducts({ products, columns = 4 }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;
  return (
    <div className="mt-16">
      <h2 className="font-bold text-2xl text-black mb-8 pl-6">Weitere Produkte entdecken</h2>
      <ProductGrid products={products.filter(p => !p.hide_from_listing)} columns={columns} />
    </div>
  );
} 