/**
 * ============================================================================
 * SERVICIO DE EMAILS TRANSACCIONALES
 * ============================================================================
 *
 * Sistema de envío de emails usando Gmail SMTP o Resend + React Email
 *
 * Configuración Gmail SMTP:
 * - SMTP_HOST=smtp.gmail.com
 * - SMTP_PORT=587
 * - SMTP_USER=tu-email@gmail.com
 * - SMTP_PASS=contraseña-de-aplicación
 *
 * Configuración Resend (alternativa):
 * - EMAIL_PROVIDER=resend
 * - RESEND_API_KEY=tu-api-key
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
import nodemailer from 'nodemailer';

// Configuración
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail'; // 'gmail' o 'resend'
const FROM_EMAIL = process.env.EMAIL_FROM || 'EDESA VENTAS <pedidos@edesaventas.ec>';
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || 'EDESA VENTAS';

// Inicializar cliente Resend (solo si se usa)
const resend = EMAIL_PROVIDER === 'resend' ? new Resend(process.env.RESEND_API_KEY) : null;

// Configurar transporter de Gmail
const gmailTransporter = EMAIL_PROVIDER === 'gmail' ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

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
 * Envía un email usando Gmail SMTP o Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // En desarrollo sin configuración, solo mostrar log
  if (isDevelopment && !process.env.SMTP_USER && !process.env.RESEND_API_KEY) {
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

    // Usar Gmail SMTP
    if (EMAIL_PROVIDER === 'gmail' && gmailTransporter) {
      const info = await gmailTransporter.sendMail({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
        })),
      });

      console.log('✅ Email enviado vía Gmail:', info.messageId);
      return { success: true, id: info.messageId };
    }

    // Usar Resend (alternativa)
    if (EMAIL_PROVIDER === 'resend' && resend) {
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

      console.log('✅ Email enviado vía Resend:', data?.id);
      return { success: true, id: data?.id };
    }

    throw new Error('No se configuró ningún proveedor de email válido');
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
 * Envía email de recuperación de carrito abandonado
 */
export async function sendCartRecoveryEmail(
  to: string,
  cartData: {
    customerName: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      name: string;
      sku?: string;
    }>;
    total: number;
  }
) {
  const { CartRecoveryEmail } = await import('@/emails/CartRecoveryEmail');

  const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout`;

  return sendEmail({
    to,
    subject: '¡Tu carrito te espera! 🛒',
    react: CartRecoveryEmail({
      ...cartData,
      checkoutUrl,
    }),
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
