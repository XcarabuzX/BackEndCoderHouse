/**
 * Error de aplicación con código de estado HTTP asociado.
 * Permite que la lógica de negocio lance errores semánticos y que el
 * manejador global de errores responda con el status correcto.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
