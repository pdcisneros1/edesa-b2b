'use client';

import { ProductSales } from '@/types/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/format';
import { TrendingUp, Package } from 'lucide-react';

interface TopProductsTableProps {
  products: ProductSales[];
  title?: string;
}

export function TopProductsTable({ products, title = 'Productos Más Vendidos' }: TopProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Costo</TableHead>
                <TableHead className="text-right">Ganancia</TableHead>
                <TableHead className="text-right">Margen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay datos de ventas disponibles
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, index) => (
                  <TableRow key={product.productSku}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {index + 1}
                        </Badge>
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {product.productSku}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium max-w-xs truncate">
                        {product.productName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.categoryName}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{product.unitsSold}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatPrice(product.revenue)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatPrice(product.cost)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {formatPrice(product.profit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={product.profitMargin >= 30 ? 'default' : 'secondary'}
                        className={
                          product.profitMargin >= 30
                            ? 'bg-green-100 text-green-800'
                            : product.profitMargin >= 20
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {product.profitMargin.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
