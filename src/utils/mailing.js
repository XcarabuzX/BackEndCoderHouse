import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

/**
 * Servicio de envío de correos basado en Nodemailer.
 * La configuración SMTP se toma íntegramente de las variables de entorno.
 */
class MailingService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: {
        user: config.mail.user,
        pass: config.mail.pass
      }
    });
  }

  /**
   * Envía el correo de recuperación de contraseña con un botón que enlaza
   * al formulario de restablecimiento. El enlace expira en 1 hora.
   */
  async sendPasswordResetEmail(to, resetLink) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#333;">Recuperación de contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Hacé clic en el botón para crear una nueva contraseña. Este enlace
        <strong>expira en 1 hora</strong>.</p>
        <p style="text-align:center; margin: 32px 0;">
          <a href="${resetLink}"
             style="background:#2d8cff; color:#fff; padding:12px 24px;
                    border-radius:6px; text-decoration:none; font-weight:bold;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color:#888; font-size:12px;">
          Si no solicitaste este cambio, ignorá este correo y tu contraseña
          permanecerá sin cambios.
        </p>
      </div>
    `;

    return this.transporter.sendMail({
      from: config.mail.from,
      to,
      subject: 'Recuperación de contraseña - Ecommerce CoderHouse',
      html
    });
  }
}

export const mailingService = new MailingService();
