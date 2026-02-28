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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
}

export function PasswordResetEmail({ userName, resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recupera tu contraseña - EDESA VENTAS</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            title="Recuperación de Contraseña"
            subtitle="Restablece tu acceso de forma segura"
          />

          <Text style={text}>Hola {userName},</Text>

          <Text style={text}>
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            Si no fuiste tú, puedes ignorar este correo de forma segura.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Restablecer Contraseña
            </Button>
          </Section>

          <Text style={text}>
            O copia y pega este enlace en tu navegador:
          </Text>
          <Text style={linkText}>
            {resetUrl}
          </Text>

          <Hr style={hr} />

          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad.
            </Text>
          </Section>

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

const linkText = {
  color: '#0066cc',
  fontSize: '14px',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 40px',
};

const warningText = {
  color: '#78350f',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
};
