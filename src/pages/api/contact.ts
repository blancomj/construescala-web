import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, phone, service, message } = data;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    const serviceLabels: Record<string, string> = {
      remodelacion: 'Remodelación',
      diseno: 'Diseño Arquitectónico',
      interiorismo: 'Interiorismo',
      madera: 'Madera & Ambientación',
      otro: 'Otro',
    };

    await transporter.sendMail({
      from: `CONSTRUESCALA Website <${import.meta.env.SMTP_USER}>`,
      to: import.meta.env.MAIL_TO,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} - ${serviceLabels[service] || service || 'Sin especificar'}`,
      text: `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone || 'No proporcionado'}\nTipo de proyecto: ${serviceLabels[service] || service || 'No especificado'}\n\nMensaje:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c9a96e; border-bottom: 2px solid #c9a96e; padding-bottom: 10px;">Nuevo mensaje de contacto</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Nombre:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Correo:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Teléfono:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${phone || 'No proporcionado'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tipo de proyecto:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${serviceLabels[service] || service || 'No especificado'}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f0eb; border-left: 4px solid #c9a96e;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Mensaje:</h3>
            <p style="color: #6b6b6b; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #8a8a8a; font-size: 12px; margin-top: 20px;">
            Este mensaje fue enviado desde el formulario de contacto de construescala.com
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ ok: false, error: 'Error sending email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};