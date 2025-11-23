"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ShopifyOrder } from "@/lib/shopify-admin";

interface OrderDetailProps {
  order: ShopifyOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetail({ order, open, onOpenChange }: OrderDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string, currency: string = "EUR") => {
    return `${parseFloat(price).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let label = status;

    if (statusLower.includes("paid") || statusLower.includes("bezahlt")) {
      variant = "default";
      label = "Bezahlt";
    } else if (statusLower.includes("pending") || statusLower.includes("ausstehend")) {
      variant = "secondary";
      label = "Ausstehend";
    } else if (statusLower.includes("refunded") || statusLower.includes("erstattet")) {
      variant = "destructive";
      label = "Erstattet";
    } else {
      label = status.charAt(0).toUpperCase() + status.slice(1);
    }

    return <Badge variant={variant}>{label}</Badge>;
  };

  const getFulfillmentBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Nicht versandt</Badge>;
    
    const statusLower = status.toLowerCase();
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let label = status;

    if (statusLower.includes("fulfilled") || statusLower.includes("versandt")) {
      variant = "default";
      label = "Versandt";
    } else if (statusLower.includes("partial") || statusLower.includes("teilweise")) {
      variant = "secondary";
      label = "Teilweise versandt";
    } else if (statusLower.includes("unfulfilled") || statusLower.includes("nicht")) {
      variant = "outline";
      label = "Nicht versandt";
    } else {
      label = status.charAt(0).toUpperCase() + status.slice(1);
    }

    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bestellung #{order.order_number}</DialogTitle>
          <DialogDescription>
            Bestelldetails und Artikelübersicht
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Bestellinformationen */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Bestelldatum</p>
              <p className="text-sm text-gray-900">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bearbeitungsdatum</p>
              <p className="text-sm text-gray-900">
                {order.processed_at ? formatDate(order.processed_at) : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Zahlungsstatus</p>
              <div className="mt-1">{getStatusBadge(order.financial_status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Versandstatus</p>
              <div className="mt-1">
                {getFulfillmentBadge(order.fulfillment_status)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Artikel */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Artikel</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artikel</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Menge</TableHead>
                    <TableHead className="text-right">Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamtpreis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.line_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.variant_title && (
                            <p className="text-sm text-gray-500">
                              {item.variant_title}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.sku || "-"}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.price, order.currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(
                          (
                            parseFloat(item.price) * item.quantity -
                            parseFloat(item.total_discount || "0")
                          ).toString(),
                          order.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          {/* Preisübersicht */}
          <div className="flex justify-end">
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Zwischensumme</span>
                <span className="text-gray-900">
                  {formatPrice(order.subtotal_price, order.currency)}
                </span>
              </div>
              {parseFloat(order.total_tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MwSt.</span>
                  <span className="text-gray-900">
                    {formatPrice(order.total_tax, order.currency)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Gesamtpreis</span>
                <span>{formatPrice(order.total_price, order.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

