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

interface CartRecoveryEmailProps {
  customerName: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
    sku?: string;
  }>;
  total: number;
  checkoutUrl: string;
}

export function CartRecoveryEmail({
  customerName,
  items,
  total,
  checkoutUrl,
}: CartRecoveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Tu carrito te espera! - EDESA VENTAS</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            title="¡Tu carrito te espera! 🛒"
            subtitle="Completa tu compra"
          />

          <Text style={text}>Hola {customerName},</Text>

          <Text style={text}>
            Notamos que dejaste algunos productos en tu carrito. ¡No te preocupes, los guardamos
            para ti!
          </Text>

          <Section style={cartBox}>
            <Text style={cartTitle}>
              🛒 <strong>{items.length}</strong> {items.length === 1 ? 'producto' : 'productos'} en tu carrito
            </Text>
          </Section>

          {/* Tabla de productos */}
          <Section style={productTable}>
            <Row style={productTableHeader}>
              <Column style={{ width: '55%', padding: '8px' }}>
                <Text style={productTableHeaderText}>Producto</Text>
              </Column>
              <Column style={{ width: '15%', padding: '8px', textAlign: 'center' }}>
                <Text style={productTableHeaderText}>Cant.</Text>
              </Column>
              <Column style={{ width: '30%', padding: '8px', textAlign: 'right' }}>
                <Text style={productTableHeaderText}>Precio</Text>
              </Column>
            </Row>

            {items.slice(0, 5).map((item, index) => (
              <Row key={index} style={productTableRow}>
                <Column style={{ width: '55%', padding: '8px' }}>
                  <Text style={productTableCellText}>{item.name}</Text>
                  {item.sku && (
                    <Text style={skuText}>SKU: {item.sku}</Text>
                  )}
                </Column>
                <Column style={{ width: '15%', padding: '8px', textAlign: 'center' }}>
                  <Text style={productTableCellText}>{item.quantity}</Text>
                </Column>
                <Column style={{ width: '30%', padding: '8px', textAlign: 'right' }}>
                  <Text style={productTableCellText}>${(item.price * item.quantity).toFixed(2)}</Text>
                </Column>
              </Row>
            ))}

            {items.length > 5 && (
              <Row style={moreItemsRow}>
                <Column style={{ padding: '8px', textAlign: 'center' }}>
                  <Text style={moreItemsText}>
                    + {items.length - 5} {items.length - 5 === 1 ? 'producto más' : 'productos más'}
                  </Text>
                </Column>
              </Row>
            )}

            <Row style={productTableTotal}>
              <Column style={{ width: '70%', padding: '12px 8px', textAlign: 'right' }}>
                <Text style={totalText}><strong>TOTAL:</strong></Text>
              </Column>
              <Column style={{ width: '30%', padding: '12px 8px', textAlign: 'right' }}>
                <Text style={totalAmount}><strong>${total.toFixed(2)}</strong></Text>
              </Column>
            </Row>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={checkoutUrl}>
              Completar Mi Compra
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={benefitsTitle}>
            <strong>¿Por qué comprar con nosotros?</strong>
          </Text>
          <Text style={text}>
            ✅ Envío rápido a todo Ecuador<br />
            ✅ Productos de calidad garantizada<br />
            ✅ Precios especiales para mayoristas<br />
            ✅ Soporte personalizado
          </Text>

          <Text style={urgencyText}>
            💡 <em>Tu carrito estará disponible por 7 días más</em>
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

const cartBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 40px',
};

const cartTitle = {
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

const skuText = {
  fontSize: '12px',
  color: '#666',
  margin: '4px 0 0 0',
};

const moreItemsRow = {
  backgroundColor: '#f9fafb',
  borderBottom: '1px solid #e6ebf1',
};

const moreItemsText = {
  fontSize: '14px',
  color: '#666',
  fontStyle: 'italic',
  margin: '8px 0',
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

const benefitsTitle = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '20px 40px 0 40px',
  marginBottom: '0',
};

const urgencyText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '20px 40px',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};
