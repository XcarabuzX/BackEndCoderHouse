import dotenv from 'dotenv';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Configuración centralizada de la aplicación.
// Toda la app debe leer sus parámetros desde aquí y nunca usar valores hardcodeados.
export const config = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce?directConnection=true',

  jwt: {
    secret: process.env.JWT_SECRET || 'coderHouseSecret2024',
    cookieName: process.env.JWT_COOKIE_NAME || 'coderCookie',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // URL pública del cliente, usada para armar el enlace de recuperación de contraseña.
  clientUrl: process.env.CLIENT_URL || 'http://localhost:8080',

  // Tiempo de expiración (en minutos) del enlace de recuperación de contraseña.
  resetPasswordExpiresMin: Number(process.env.RESET_PASSWORD_EXPIRES_MIN) || 60,

  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'Ecommerce CoderHouse <no-reply@coder.com>'
  }
};
