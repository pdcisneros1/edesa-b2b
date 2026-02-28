import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  total: number;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  total,
  items,
}: OrderConfirmationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edesa-ventas.vercel.app';

  return (
    <Html>
      <Head />
      <Preview>Confirmación de Pedido {orderNumber} - EDESA VENTAS</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            title="¡Pedido Confirmado!"
            subtitle={`Pedido ${orderNumber}`}
          />

          <Text style={text}>Hola {customerName},</Text>

          <Text style={text}>
            Hemos recibido tu pedido y lo estamos procesando. A continuación encontrarás el
            detalle:
          </Text>

          <Section style={orderBox}>
            <Text style={orderNumberStyle}>
              <strong>Pedido:</strong> {orderNumber}
            </Text>
          </Section>

          {/* Tabla de productos */}
          <Section style={productTable}>
            <Row style={productTableHeader}>
              <Column style={{ width: '50%', padding: '8px' }}>
                <Text style={productTableHeaderText}>Producto</Text>
              </Column>
              <Column style={{ width: '15%', padding: '8px', textAlign: 'center' }}>
                <Text style={productTableHeaderText}>Cant.</Text>
              </Column>
              <Column style={{ width: '17.5%', padding: '8px', textAlign: 'right' }}>
                <Text style={productTableHeaderText}>Precio</Text>
              </Column>
              <Column style={{ width: '17.5%', padding: '8px', textAlign: 'right' }}>
                <Text style={productTableHeaderText}>Subtotal</Text>
              </Column>
            </Row>

            {items.map((item, index) => (
              <Row key={index} style={productTableRow}>
                <Column style={{ width: '50%', padding: '8px' }}>
                  <Text style={productTableCellText}>{item.productName}</Text>
                </Column>
                <Column style={{ width: '15%', padding: '8px', textAlign: 'center' }}>
                  <Text style={productTableCellText}>{item.quantity}</Text>
                </Column>
                <Column style={{ width: '17.5%', padding: '8px', textAlign: 'right' }}>
                  <Text style={productTableCellText}>${item.unitPrice.toFixed(2)}</Text>
                </Column>
                <Column style={{ width: '17.5%', padding: '8px', textAlign: 'right' }}>
                  <Text style={productTableCellText}>${item.subtotal.toFixed(2)}</Text>
                </Column>
              </Row>
            ))}

            <Row style={productTableTotal}>
              <Column style={{ width: '82.5%', padding: '12px 8px', textAlign: 'right' }}>
                <Text style={totalText}><strong>TOTAL:</strong></Text>
              </Column>
              <Column style={{ width: '17.5%', padding: '12px 8px', textAlign: 'right' }}>
                <Text style={totalAmount}><strong>${total.toFixed(2)}</strong></Text>
              </Column>
            </Row>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/cuenta`}>
              Ver Estado del Pedido
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            <strong>Próximos pasos:</strong>
          </Text>
          <Text style={text}>
            1. Procesaremos tu pedido en las próximas 24 horas<br />
            2. Te notificaremos cuando esté listo para envío<br />
            3. Recibirás la factura electrónica por email
          </Text>

          <EmailFooter />
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
  padding: '0',
  marginBottom: '64px',
  maxWidth: '600px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const orderBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #22c55e',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 40px',
};

const orderNumberStyle = {
  color: '#333',
  fontSize: '18px',
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

const productTableTotal = {
  backgroundColor: '#f6f9fc',
  borderTop: '2px solid #e6ebf1',
};

const totalText = {
  fontSize: '16px',
  color: '#333',
  margin: '0',
};

const totalAmount = {
  fontSize: '18px',
  color: '#dc2626',
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
