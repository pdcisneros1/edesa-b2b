/**
 * EmailFooter - Componente reutilizable para footers de emails
 *
 * Incluye información legal y de contacto consistente
 */

import { Section, Text, Hr } from '@react-email/components';

interface EmailFooterProps {
  showContactInfo?: boolean;
}

export function EmailFooter({ showContactInfo = true }: EmailFooterProps) {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'EDESA VENTAS';
  const companyRuc = process.env.NEXT_PUBLIC_COMPANY_RUC || '1790XXXXXXXX001';

  return (
    <>
      <Hr style={hr} />
      <Section style={footer}>
        {showContactInfo && (
          <Text style={contactText}>
            <strong>{companyName}</strong><br />
            Email: pedidos@edesaventas.ec<br />
            Teléfono: +593 999 999 999
          </Text>
        )}
        <Text style={legalText}>
          RUC: {companyRuc}<br />
          Quito, Ecuador
        </Text>
        <Text style={disclaimerText}>
          Este correo fue enviado desde una dirección de solo envío. Por favor no respondas directamente a este email.
        </Text>
      </Section>
    </>
  );
}

// Estilos
const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 40px 20px',
};

const footer = {
  padding: '0 40px 40px',
  textAlign: 'center' as const,
};

const contactText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px 0',
};

const legalText = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 12px 0',
};

const disclaimerText = {
  color: '#bbbbbb',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '0',
  fontStyle: 'italic',
};
