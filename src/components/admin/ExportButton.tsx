'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToPDF, formatDataForExport } from '@/lib/export';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  filename: string;
  columns: { header: string; dataKey: string }[];
  title: string;
}

export function ExportButton({ data, filename, columns, title }: ExportButtonProps) {
  const handleExportExcel = () => {
    try {
      if (data.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      // Preparar datos para exportación
      const formattedData = formatDataForExport(data);

      // Crear objeto con solo las columnas especificadas
      const exportData = formattedData.map((row) => {
        const exportRow: any = {};
        columns.forEach((col) => {
          exportRow[col.header] = row[col.dataKey] || '';
        });
        return exportRow;
      });

      exportToExcel(exportData, filename);
      toast.success('Archivo Excel generado exitosamente');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error al generar archivo Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      if (data.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      const formattedData = formatDataForExport(data);
      exportToPDF(formattedData, columns, title, filename);
      toast.success('Archivo PDF generado exitosamente');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Error al generar archivo PDF');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Exportar a Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
          <FileText className="h-4 w-4 text-red-600" />
          Exportar a PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
