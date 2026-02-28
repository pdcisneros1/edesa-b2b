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
          <Heading style={h1}>¡Bienvenido a EDESA VENTAS!</Heading>

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

          <Hr style={hr} />

          <Text style={footer}>
            Si tienes alguna pregunta, no dudes en contactarnos.<br />
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
