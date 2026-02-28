import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';

interface LowStockAlertEmailProps {
  products: Array<{
    name: string;
    sku: string;
    stock: number;
    minStock?: number;
  }>;
}

export function LowStockAlertEmail({ products }: LowStockAlertEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edesa-ventas.vercel.app';

  return (
    <Html>
      <Head />
      <Preview>⚠️ Alerta de Stock Bajo - {String(products.length)} productos requieren atención</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Alerta de Stock Bajo</Heading>

          <Section style={alertBox}>
            <Text style={alertText}>
              {String(products.length)} producto{products.length > 1 ? 's' : ''} con stock bajo
            </Text>
          </Section>

          <Text style={text}>
            Los siguientes productos tienen stock por debajo del mínimo recomendado:
          </Text>

          {/* Tabla de productos con stock bajo */}
          <Section style={productTable}>
            <Row style={productTableHeader}>
              <Column style={{ width: '50%', padding: '8px' }}>
                <Text style={productTableHeaderText}>Producto</Text>
              </Column>
              <Column style={{ width: '25%', padding: '8px', textAlign: 'center' }}>
                <Text style={productTableHeaderText}>SKU</Text>
              </Column>
              <Column style={{ width: '12.5%', padding: '8px', textAlign: 'center' }}>
                <Text style={productTableHeaderText}>Stock</Text>
              </Column>
              <Column style={{ width: '12.5%', padding: '8px', textAlign: 'center' }}>
                <Text style={productTableHeaderText}>Mín.</Text>
              </Column>
            </Row>

            {products.map((product, index) => (
              <Row key={index} style={productTableRow}>
                <Column style={{ width: '50%', padding: '8px' }}>
                  <Text style={productTableCellText}>{product.name}</Text>
                </Column>
                <Column style={{ width: '25%', padding: '8px', textAlign: 'center' }}>
                  <Text style={productTableCellText}>{product.sku}</Text>
                </Column>
                <Column style={{ width: '12.5%', padding: '8px', textAlign: 'center' }}>
                  <Text style={{
                    ...productTableCellText,
                    color: product.stock === 0 ? '#dc2626' : product.stock < 5 ? '#f59e0b' : '#333',
                    fontWeight: 'bold',
                  }}>
                    {String(product.stock)}
                  </Text>
                </Column>
                <Column style={{ width: '12.5%', padding: '8px', textAlign: 'center' }}>
                  <Text style={productTableCellText}>{String(product.minStock || 10)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/admin/productos`}>
              Ver Inventario Completo
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            <strong>Recomendaciones:</strong>
          </Text>
          <Text style={text}>
            1. Verifica la demanda reciente de estos productos<br />
            2. Contacta a proveedores para reabastecimiento<br />
            3. Considera crear una orden de compra<br />
            4. Actualiza el stock mínimo si es necesario
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Este es un email automático del sistema de gestión de inventario.<br />
            <strong>EDESA VENTAS</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const alertBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 40px',
};

const alertText = {
  color: '#78350f',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
};

const productTable = {
  margin: '24px 40px',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  overflow: 'hidden',
};

const productTableHeader = {
  backgroundColor: '#f6f9fc',
  borderBottom: '2px solid #e6ebf1',
};

const productTableHeaderText = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#666',
  textTransform: 'uppercase' as const,
  margin: '0',
};

const productTableRow = {
  borderBottom: '1px solid #e6ebf1',
};

const productTableCellText = {
  fontSize: '14px',
  color: '#333',
  margin: '0',
};

const buttonContainer = {
  padding: '27px 40px',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
};
