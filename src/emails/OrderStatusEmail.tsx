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
} from '@react-email/components';

interface OrderStatusEmailProps {
  orderNumber: string;
  customerName: string;
  status: string;
  statusMessage: string;
}

const STATUS_COLORS: Record<string, string> = {
  pendiente_pago: '#f59e0b',
  confirmado: '#22c55e',
  en_preparacion: '#3b82f6',
  enviado: '#8b5cf6',
  entregado: '#10b981',
  cancelado: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pendiente_pago: 'Pendiente de Pago',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export function OrderStatusEmail({
  orderNumber,
  customerName,
  status,
  statusMessage,
}: OrderStatusEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edesa-ventas.vercel.app';
  const statusColor = STATUS_COLORS[status] || '#6b7280';
  const statusLabel = STATUS_LABELS[status] || status;

  return (
    <Html>
      <Head />
      <Preview>Actualización de Pedido {orderNumber} - {statusLabel}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Actualización de Pedido</Heading>

          <Text style={text}>Hola {customerName},</Text>

          <Text style={text}>
            Tu pedido <strong>{orderNumber}</strong> ha sido actualizado.
          </Text>

          <Section style={{ ...statusBox, borderColor: statusColor }}>
            <Text style={{ ...statusLabel, color: statusColor }}>
              Estado: <strong>{STATUS_LABELS[status] || status}</strong>
            </Text>
            <Text style={statusMessage}>
              {statusMessage}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/cuenta`}>
              Ver Detalles del Pedido
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Si tienes alguna pregunta, contáctanos:<br />
            <strong>EDESA VENTAS</strong><br />
            Email: pedidos@edesaventas.ec<br />
            Teléfono: +593 999 999 999
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

const statusBox = {
  backgroundColor: '#f9fafb',
  border: '2px solid',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 40px',
};

const statusLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const statusMessage = {
  fontSize: '14px',
  color: '#666',
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
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
