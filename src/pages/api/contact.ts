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

    const projectName = serviceLabels[service] || service || 'Sin especificar';

    await transporter.sendMail({
      from: {
        name: 'CONSTRUESCALA - Formulario Web',
        address: import.meta.env.SMTP_USER,
      },
      to: import.meta.env.MAIL_TO,
      replyTo: { name: name, address: email },
      sender: import.meta.env.SMTP_USER,
      subject: `[Sitio Web] Consulta: ${projectName} - ${name}`,
      headers: {
        'X-Mailer': 'CONSTRUESCALA Web',
        'List-Unsubscribe': `<mailto:${import.meta.env.SMTP_USER}?subject=unsubscribe>`,
      },
      text: `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone || 'No proporcionado'}\nTipo de proyecto: ${projectName}\n\nMensaje:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
            <h1 style="color: #c9a96e; margin: 0; font-size: 24px;">CONSTRUESCALA</h1>
            <p style="color: #8a8a8a; margin: 5px 0 0 0; font-size: 12px;">Mensaje desde el sitio web</p>
          </div>
          <div style="padding: 25px;">
            <h2 style="color: #1a1a1a; border-bottom: 2px solid #c9a96e; padding-bottom: 10px; margin-top: 0;">
              Nuevo mensaje de contacto
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a; width: 140px;">Nombre:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #6b6b6b;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Correo:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #6b6b6b;"><a href="mailto:${email}" style="color: #c9a96e; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Teléfono:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #6b6b6b;">${phone || 'No proporcionado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Proyecto:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #6b6b6b;">${projectName}</td>
              </tr>
            </table>
            <div style="background-color: #f5f0eb; border-left: 4px solid #c9a96e; padding: 15px 20px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1a1a1a; font-size: 14px;">Mensaje:</h3>
              <p style="color: #6b6b6b; margin-bottom: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #8a8a8a; font-size: 11px; text-align: center; margin: 0;">
              Este mensaje fue enviado desde el formulario de contacto de construescala.com
            </p>
          </div>
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