import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Order } from '@/types/sales';

// Registrar fuentes (opcional - se puede usar las predeterminadas)
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular.woff',
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#dc2626',
  },
  logo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#333',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 9,
    color: '#666',
  },
  // Customer info
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    fontSize: 9,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: '#1a1a1a',
  },
  // Table
  table: {
    marginVertical: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableCellText: {
    fontSize: 9,
    color: '#1f2937',
  },
  // Columns
  col1: { width: '50%' },  // Producto
  col2: { width: '15%', textAlign: 'center' },  // Cantidad
  col3: { width: '17.5%', textAlign: 'right' },  // Precio
  col4: { width: '17.5%', textAlign: 'right' },  // Subtotal
  // Totals
  totalsContainer: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: 250,
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  totalRowFinal: {
    flexDirection: 'row',
    width: 250,
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  totalLabelFinal: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  totalValueFinal: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  // Footer
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  paymentInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
  },
  paymentTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 6,
  },
  paymentText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.4,
  },
});

interface InvoicePDFProps {
  order: Order;
  companyInfo?: {
    name: string;
    ruc: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountType: string;
  };
}

export function InvoicePDF({ order, companyInfo, bankInfo }: InvoicePDFProps) {
  const company = companyInfo || {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'EDESA VENTAS',
    ruc: process.env.NEXT_PUBLIC_COMPANY_RUC || '1790XXXXXXXX001',
    address: 'Quito, Ecuador',
    phone: '+593 2 234-5678',
    email: 'info@edesaventas.ec',
  };

  const bank = bankInfo || {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Banco Pichincha',
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT || '2200-XXXXXXXXX',
    accountType: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TYPE || 'Cuenta Corriente',
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companyDetails}>
              RUC: {company.ruc}{'\n'}
              {company.address}{'\n'}
              {company.phone} • {company.email}
            </Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>No. {order.orderNumber}</Text>
            <Text style={styles.invoiceDate}>Fecha: {formatDate(order.createdAt)}</Text>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{order.customerName}</Text>
          </View>
          {order.customerCompany && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Empresa:</Text>
              <Text style={styles.value}>{order.customerCompany}</Text>
            </View>
          )}
          {order.customerTaxId && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>RUC/CI:</Text>
              <Text style={styles.value}>{order.customerTaxId}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{order.customerEmail}</Text>
          </View>
          {order.customerPhone && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Teléfono:</Text>
              <Text style={styles.value}>{order.customerPhone}</Text>
            </View>
          )}
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Envío</Text>
          <Text style={styles.value}>
            {order.shippingAddress.street}{'\n'}
            {order.shippingAddress.city}, {order.shippingAddress.province}{'\n'}
            {order.shippingAddress.zipCode}, {order.shippingAddress.country}
          </Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>PRODUCTO</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>CANT.</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>PRECIO</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>SUBTOTAL</Text>
          </View>

          {/* Rows */}
          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.col1]}>
                {item.productName}{'\n'}
                <Text style={{ fontSize: 8, color: '#6b7280' }}>SKU: {item.productSku}</Text>
              </Text>
              <Text style={[styles.tableCellText, styles.col2]}>{item.quantity}</Text>
              <Text style={[styles.tableCellText, styles.col3]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.tableCellText, styles.col4]}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Envío:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.shipping)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (15%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.tax)}</Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabelFinal}>TOTAL:</Text>
            <Text style={styles.totalValueFinal}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Payment Information (if bank transfer) */}
        {order.paymentMethod === 'transferencia' && (
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>INFORMACIÓN DE PAGO - TRANSFERENCIA BANCARIA</Text>
            <Text style={styles.paymentText}>
              Banco: {bank.bankName}{'\n'}
              Cuenta: {bank.accountType} {bank.accountNumber}{'\n'}
              Beneficiario: {company.name}{'\n'}
              RUC: {company.ruc}{'\n'}
              Referencia: {order.orderNumber}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Gracias por su compra.{'\n'}
            {company.name} • {company.ruc}{'\n'}
            {company.email} • {company.phone}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
