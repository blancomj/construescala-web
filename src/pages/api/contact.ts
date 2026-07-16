import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

// Rate limiting - 3 requests per 5 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

function sanitizeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#047;');
}

function sanitizeInput(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return sanitizeHTML(input.trim().slice(0, maxLength));
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (isRateLimited(clientIP)) {
      return new Response(JSON.stringify({ ok: false, error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await request.json();
    const { name, email, phone, service, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize all inputs
    const cleanName = sanitizeInput(name, 100);
    const cleanEmail = sanitizeInput(email, 254);
    const cleanPhone = sanitizeInput(phone, 20);
    const cleanMessage = sanitizeInput(message, 2000);

    // Validate email format
    if (!validateEmail(cleanEmail)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate name (at least 2 characters)
    if (cleanName.length < 2) {
      return new Response(JSON.stringify({ ok: false, error: 'Name must be at least 2 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate message (at least 10 characters)
    if (cleanMessage.length < 10) {
      return new Response(JSON.stringify({ ok: false, error: 'Message must be at least 10 characters' }), {
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

    const projectName = serviceLabels[service] || 'Sin especificar';

    await transporter.sendMail({
      from: {
        name: 'CONSTRUESCALA - Formulario Web',
        address: import.meta.env.SMTP_USER,
      },
      to: import.meta.env.MAIL_TO,
      replyTo: { name: cleanName, address: cleanEmail },
      sender: import.meta.env.SMTP_USER,
      subject: `[Sitio Web] Consulta: ${projectName} - ${cleanName}`,
      headers: {
        'X-Mailer': 'CONSTRUESCALA Web',
        'List-Unsubscribe': `<mailto:${import.meta.env.SMTP_USER}?subject=unsubscribe>`,
      },
      text: `Nombre: ${cleanName}\nCorreo: ${cleanEmail}\nTeléfono: ${cleanPhone || 'No proporcionado'}\nTipo de proyecto: ${projectName}\n\nMensaje:\n${cleanMessage}`,
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
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #6b6b6b;">${cleanName}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Correo:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #6b6b6b;"><a href="mailto:${cleanEmail}" style="color: #c9a96e; text-decoration: none;">${cleanEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Teléfono:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #6b6b6b;">${cleanPhone || 'No proporcionado'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Proyecto:</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; color: #6b6b6b;">${projectName}</td>
              </tr>
            </table>
            <div style="background-color: #f5f0eb; border-left: 4px solid #c9a96e; padding: 15px 20px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1a1a1a; font-size: 14px;">Mensaje:</h3>
              <p style="color: #6b6b6b; margin-bottom: 0; white-space: pre-wrap; line-height: 1.6;">${cleanMessage}</p>
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
