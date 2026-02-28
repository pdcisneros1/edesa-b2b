// Script de prueba para verificar Gmail SMTP
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Probando Gmail SMTP...\n');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'pdcisneros@gmail.com',
      pass: 'awkiafkoyhannfce',
    },
  });

  try {
    console.log('📧 Enviando email de prueba...');

    const info = await transporter.sendMail({
      from: 'EDESA VENTAS <pdcisneros@gmail.com>',
      to: 'pdcisneros@gmail.com',
      subject: 'Prueba de Gmail SMTP - EDESA VENTAS',
      html: `
        <h1>✅ Gmail SMTP Funcionando</h1>
        <p>Si recibes este email, Gmail SMTP está configurado correctamente.</p>
        <p><strong>Hora:</strong> ${new Date().toLocaleString('es-EC')}</p>
      `,
    });

    console.log('✅ Email enviado exitosamente!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📬 Revisa tu bandeja de entrada: pdcisneros@gmail.com');
  } catch (error) {
    console.error('❌ Error al enviar email:');
    console.error(error.message);
    console.error('\n🔍 Detalles del error:', error);
  }
}

testEmail();
