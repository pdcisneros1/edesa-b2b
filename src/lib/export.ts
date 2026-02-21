import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporta datos a un archivo Excel (.xlsx)
 */
export function exportToExcel(data: any[], filename: string): void {
  // Crear un nuevo workbook
  const workbook = XLSX.utils.book_new();

  // Convertir datos a hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Agregar la hoja al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

  // Escribir y descargar el archivo
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Exporta datos a un archivo PDF
 */
export function exportToPDF(
  data: any[],
  columns: { header: string; dataKey: string }[],
  title: string,
  filename: string
): void {
  // Crear nuevo documento PDF
  const doc = new jsPDF();

  // Agregar título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);

  // Agregar fecha de generación
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Generado: ${today}`, 14, 28);

  // Preparar datos para la tabla
  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.dataKey];
      if (value === null || value === undefined) return '';
      return String(value);
    })
  );

  // Agregar tabla
  (doc as any).autoTable({
    head: [headers],
    body: rows,
    startY: 35,
    theme: 'striped',
    headStyles: {
      fillColor: [220, 38, 38], // red-600
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
  });

  // Descargar el PDF
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Formatea datos para exportación, convirtiendo valores complejos a strings
 */
export function formatDataForExport(data: any[]): any[] {
  return data.map((item) => {
    const formatted: any = {};

    for (const [key, value] of Object.entries(item)) {
      if (value === null || value === undefined) {
        formatted[key] = '';
      } else if (value instanceof Date) {
        formatted[key] = value.toLocaleDateString('es-EC');
      } else if (typeof value === 'object') {
        // Convertir objetos a JSON string
        formatted[key] = JSON.stringify(value);
      } else {
        formatted[key] = value;
      }
    }

    return formatted;
  });
}
