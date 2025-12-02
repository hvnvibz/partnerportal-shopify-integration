"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUpDown, Eye } from "lucide-react";
import type { ShopifyOrder } from "@/lib/shopify-admin";
import { OrderDetail } from "./order-detail";

interface OrderHistoryProps {
  orders: ShopifyOrder[];
  loading?: boolean;
}

type SortField = "created_at" | "total_price";
type SortDirection = "asc" | "desc";

export function OrderHistory({ orders, loading }: OrderHistoryProps) {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: string, currency: string = "EUR") => {
    return `${parseFloat(price).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "created_at":
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case "total_price":
        aValue = parseFloat(a.total_price);
        bValue = parseFloat(b.total_price);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const renderLineItems = (lineItems: typeof orders[0]["line_items"]) => {
    if (lineItems.length === 0) return <span className="text-gray-400">Keine Artikel</span>;
    
    const maxVisible = 2;
    const visibleItems = lineItems.slice(0, maxVisible);
    const remainingCount = lineItems.length - maxVisible;

    return (
      <div className="space-y-1.5">
        {visibleItems.map((item, index) => (
          <div key={item.id} className="flex items-start gap-2 text-sm">
            <span className="text-gray-600 font-medium min-w-[2ch]">{item.quantity}x</span>
            <span className="text-gray-900 flex-1">{item.title}</span>
            {item.variant_title && (
              <span className="text-gray-500 text-xs">({item.variant_title})</span>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-gray-500 pt-1">
            + {remainingCount} weitere Artikel
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Noch keine Bestellungen vorhanden</p>
        <p className="text-sm mt-2">Ihre Bestellungen werden hier angezeigt, sobald Sie eine Bestellung aufgegeben haben.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 -ml-3"
                  onClick={() => handleSort("created_at")}
                >
                  Datum
                  {sortField === "created_at" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="min-w-[300px]">Artikel</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 -ml-3"
                  onClick={() => handleSort("total_price")}
                >
                  Gesamtpreis
                  {sortField === "total_price" && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell className="font-medium py-4">
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell className="py-4">
                  {renderLineItems(order.line_items)}
                </TableCell>
                <TableCell className="font-semibold py-4">
                  {formatPrice(order.total_price, order.currency)}
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        />
      )}
    </>
  );
}

