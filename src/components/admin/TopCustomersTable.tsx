'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CustomerSales } from '@/types/sales';
import { formatPrice } from '@/lib/format';
import { TrendingUp, User } from 'lucide-react';

interface TopCustomersTableProps {
  customers: CustomerSales[];
  limit?: number;
}

export function TopCustomersTable({ customers, limit = 10 }: TopCustomersTableProps) {
  const displayCustomers = customers.slice(0, limit);

  if (displayCustomers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Top Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No hay datos de clientes disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Top {limit} Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Órdenes</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead className="text-right">Ticket Prom.</TableHead>
              <TableHead className="text-center">Frecuencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCustomers.map((customer, index) => (
              <TableRow key={customer.customerId}>
                <TableCell className="font-medium text-gray-500">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{customer.customerName}</div>
                    <div className="text-xs text-gray-500">
                      {customer.customerCompany || customer.customerEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {customer.totalOrders}
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {formatPrice(customer.totalRevenue)}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-600">
                  {formatPrice(customer.averageOrderValue)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      customer.frequency === 'high'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : customer.frequency === 'medium'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }
                  >
                    {customer.frequency === 'high'
                      ? 'Alta'
                      : customer.frequency === 'medium'
                      ? 'Media'
                      : 'Baja'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
