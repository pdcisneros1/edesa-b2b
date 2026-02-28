/**
 * EmailHeader - Componente reutilizable para headers de emails
 *
 * Incluye logo EDESA y diseño consistente
 */

import { Section, Row, Column, Img, Text, Hr } from '@react-email/components';

interface EmailHeaderProps {
  title?: string;
  subtitle?: string;
}

export function EmailHeader({ title, subtitle }: EmailHeaderProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edesa-ventas.vercel.app';
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'EDESA VENTAS';

  return (
    <>
      <Section style={header}>
        <Row>
          <Column align="center" style={logoContainer}>
            {/* Logo placeholder - reemplazar con logo real cuando esté disponible */}
            <div style={logoPlaceholder}>
              <Text style={logoText}>E</Text>
            </div>
            <Text style={companyNameStyle}>{companyName}</Text>
          </Column>
        </Row>
      </Section>

      {(title || subtitle) && (
        <Section style={titleSection}>
          {title && <Text style={titleStyle}>{title}</Text>}
          {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </Section>
      )}
    </>
  );
}

// Estilos
const header = {
  padding: '30px 20px',
  backgroundColor: '#1a1a1a',
  borderTop: '4px solid #dc2626',
};

const logoContainer = {
  padding: '10px',
};

const logoPlaceholder = {
  display: 'inline-block',
  width: '60px',
  height: '60px',
  backgroundColor: '#dc2626',
  borderRadius: '12px',
  textAlign: 'center' as const,
  marginBottom: '12px',
};

const logoText = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
  lineHeight: '60px',
};

const companyNameStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
  textAlign: 'center' as const,
  letterSpacing: '1px',
};

const titleSection = {
  padding: '30px 40px 20px',
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const subtitleStyle = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
  textAlign: 'center' as const,
};
