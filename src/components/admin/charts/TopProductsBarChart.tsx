'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ProductSales } from '@/types/sales';
import { formatPrice } from '@/lib/format';

interface TopProductsBarChartProps {
  products: ProductSales[];
  title?: string;
  limit?: number;
}

export function TopProductsBarChart({
  products,
  title = 'Top 10 Productos',
  limit = 10,
}: TopProductsBarChartProps) {
  const chartData = products.slice(0, limit).map((p) => ({
    name: truncateProductName(p.productName),
    fullName: p.productName,
    Ingresos: p.revenue,
    Ganancias: p.profit,
    Unidades: p.unitsSold,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#888888" />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              stroke="#888888"
              width={120}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Ingresos' || name === 'Ganancias') {
                  return formatPrice(value);
                }
                return value;
              }}
              labelFormatter={(label) => {
                const item = chartData.find((d) => d.name === label);
                return item?.fullName || label;
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="Ingresos" fill="#10b981" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Ganancias" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function truncateProductName(name: string, maxLength = 20): string {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
}
