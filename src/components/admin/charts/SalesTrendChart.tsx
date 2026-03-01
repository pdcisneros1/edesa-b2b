'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '@/types/sales';
import { formatPrice } from '@/lib/format';

interface SalesTrendChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export function SalesTrendChart({ data, title = 'Tendencia de Ventas' }: SalesTrendChartProps) {
  // Formatear fechas para display
  const chartData = data.map((point) => ({
    ...point,
    displayDate: formatDateForDisplay(point.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              stroke="#888888"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#888888"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                if (isNaN(numValue)) return '0';

                if (name === 'Ingresos' || name === 'Ganancias') {
                  return formatPrice(numValue);
                }
                return numValue;
              }}
              labelStyle={{ color: '#000' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              name="Ingresos"
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Ganancias"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Órdenes"
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function formatDateForDisplay(dateString: string): string {
  // Formatos: "2026-02-15", "2026-W07", "2026-02", "2026"
  if (dateString.includes('W')) {
    // Semana: "2026-W07" → "Sem 7"
    const week = dateString.split('-W')[1];
    return `Sem ${parseInt(week)}`;
  } else if (dateString.length === 4) {
    // Año: "2026"
    return dateString;
  } else if (dateString.length === 7) {
    // Mes: "2026-02" → "Feb 26"
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('es-EC', { month: 'short', year: '2-digit' });
  } else {
    // Día: "2026-02-15" → "15 Feb"
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  }
}
