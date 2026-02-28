/**
 * ============================================================================
 * SERVICIO DE EMAILS TRANSACCIONALES
 * ============================================================================
 *
 * Sistema de envío de emails usando Resend + React Email
 *
 * Configuración:
 * - RESEND_API_KEY en .env (obtener de https://resend.com/api-keys)
 *
 * Características:
 * - Templates hermosos con React Email
 * - Soporte para adjuntos (PDFs)
 * - Manejo de errores robusto
 * - Modo de desarrollo (logs en lugar de enviar)
 * ============================================================================
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

// Inicializar cliente Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuración
const FROM_EMAIL = process.env.EMAIL_FROM || 'EDESA VENTAS <pedidos@edesaventas.ec>';
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'EDESA VENTAS';

/**
 * Opciones para envío de email
 */
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  attachments?: {
    filename: string;
    content: Buffer | string;
  }[];
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Envía un email usando Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // En desarrollo, solo mostrar log (no enviar email real)
  if (isDevelopment && !process.env.RESEND_API_KEY) {
    console.log('📧 [DEV MODE] Email que se enviaría:', {
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      attachments: options.attachments?.map(a => a.filename),
    });
    return { success: true, id: 'dev-mode-email' };
  }

  try {
    // Renderizar componente React a HTML
    const html = await render(options.react);

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html,
      attachments: options.attachments,
      cc: options.cc,
      bcc: options.bcc,
    });

    if (error) {
      console.error('❌ Error al enviar email:', error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }

    console.log('✅ Email enviado:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
}

/**
 * Envía email de confirmación de registro
 */
export async function sendWelcomeEmail(to: string, userName: string) {
  const { WelcomeEmail } = await import('@/emails/WelcomeEmail');

  return sendEmail({
    to,
    subject: `¡Bienvenido a ${COMPANY_NAME}!`,
    react: WelcomeEmail({ userName }),
  });
}

/**
 * Envía email de confirmación de pedido
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderData: {
    orderNumber: string;
    customerName: string;
    total: number;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
  },
  pdfBuffer?: Buffer
) {
  const { OrderConfirmationEmail } = await import('@/emails/OrderConfirmationEmail');

  const attachments = pdfBuffer
    ? [
        {
          filename: `Pedido-${orderData.orderNumber}.pdf`,
          content: pdfBuffer,
        },
      ]
    : undefined;

  return sendEmail({
    to,
    subject: `Confirmación de Pedido ${orderData.orderNumber}`,
    react: OrderConfirmationEmail(orderData),
    attachments,
  });
}

/**
 * Envía email de cambio de estado de pedido
 */
export async function sendOrderStatusEmail(
  to: string,
  orderData: {
    orderNumber: string;
    customerName: string;
    status: string;
    statusMessage: string;
  }
) {
  const { OrderStatusEmail } = await import('@/emails/OrderStatusEmail');

  return sendEmail({
    to,
    subject: `Actualización de Pedido ${orderData.orderNumber}`,
    react: OrderStatusEmail(orderData),
  });
}

/**
 * Envía email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName: string
) {
  const { PasswordResetEmail } = await import('@/emails/PasswordResetEmail');

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  return sendEmail({
    to,
    subject: 'Recuperación de Contraseña',
    react: PasswordResetEmail({ userName, resetUrl }),
  });
}

/**
 * Envía alerta de stock bajo al admin
 */
export async function sendLowStockAlert(
  products: Array<{
    name: string;
    sku: string;
    stock: number;
    minStock: number;
  }>
) {
  const { LowStockAlertEmail } = await import('@/emails/LowStockAlertEmail');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@edesaventas.ec';

  return sendEmail({
    to: adminEmail,
    subject: `⚠️ Alerta de Stock Bajo - ${products.length} productos`,
    react: LowStockAlertEmail({ products }),
  });
}

/**
 * Utilidad para formatear moneda
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
