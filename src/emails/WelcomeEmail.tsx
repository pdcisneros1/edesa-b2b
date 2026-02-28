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
} from '@react-email/components';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';

interface WelcomeEmailProps {
  userName: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edesa-ventas.vercel.app';

  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido a EDESA VENTAS! Tu cuenta ha sido creada exitosamente.</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            title="¡Bienvenido a EDESA VENTAS!"
            subtitle="Tu cuenta ha sido creada exitosamente"
          />

          <Text style={text}>Hola {userName},</Text>

          <Text style={text}>
            Tu cuenta ha sido creada exitosamente. Ahora puedes acceder a nuestro catálogo
            completo de productos y realizar pedidos de forma rápida y segura.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/productos`}>
              Ver Catálogo de Productos
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            <strong>Beneficios de tu cuenta B2B:</strong>
          </Text>
          <Text style={text}>
            ✓ Acceso a precios mayoristas<br />
            ✓ Historial completo de pedidos<br />
            ✓ Facturación electrónica<br />
            ✓ Soporte personalizado<br />
            ✓ Descuentos especiales
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
