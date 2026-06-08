import crypto from 'crypto';
import { userRepository, cartRepository } from '../repositories/index.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { mailingService } from '../utils/mailing.js';
import { config } from '../config/config.js';
import { AppError } from '../utils/AppError.js';

/**
 * Lógica de negocio de Usuarios: registro, validación de login,
 * DTO público y recuperación de contraseña.
 */
class UserService {
  async register({ first_name, last_name, email, age, password }) {
    const existingUser = await userRepository.getByEmail(email);
    if (existingUser) throw new AppError('El email ya está registrado', 400);

    const cart = await cartRepository.create({ products: [] });

    return userRepository.create({
      first_name,
      last_name,
      email,
      age: Number(age),
      password: createHash(password),
      cart: cart._id,
      role: 'user'
    });
  }

  async validateLogin(email, password) {
    const user = await userRepository.getByEmail(email);
    if (!user) throw new AppError('Usuario no encontrado', 401);
    if (!isValidPassword(password, user.password)) throw new AppError('Contraseña incorrecta', 401);
    return user;
  }

  /** Devuelve el DTO público (sin datos sensibles) de un usuario. */
  getPublicProfile(user) {
    return userRepository.toPublicDTO(user);
  }

  // ─── Recuperación de contraseña ────────────────────────────────────────────

  /**
   * Genera un token de recuperación, lo guarda con expiración de 1 hora
   * y envía el correo con el enlace de restablecimiento.
   */
  async requestPasswordReset(email) {
    const user = await userRepository.getByEmail(email);
    // Por seguridad no se revela si el email existe o no.
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + config.resetPasswordExpiresMin * 60 * 1000);

    await userRepository.update(user._id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    });

    const resetLink = `${config.clientUrl}/reset-password?token=${token}`;
    await mailingService.sendPasswordResetEmail(user.email, resetLink);
  }

  /**
   * Restablece la contraseña a partir de un token válido.
   *  - Verifica que el token exista y no haya expirado (1 hora).
   *  - Impide que la nueva contraseña sea igual a la anterior.
   */
  async resetPassword(token, newPassword) {
    if (!token) throw new AppError('Token de recuperación requerido', 400);
    if (!newPassword) throw new AppError('La nueva contraseña es requerida', 400);

    const user = await userRepository.getByResetToken(token);
    if (!user) throw new AppError('Token inválido', 400);

    // Validar expiración del enlace.
    if (!user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
      // Limpiar el token expirado.
      await userRepository.update(user._id, {
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      throw new AppError('El enlace de recuperación ha expirado. Solicitá uno nuevo.', 400);
    }

    // Impedir reutilizar la misma contraseña anterior.
    if (isValidPassword(newPassword, user.password)) {
      throw new AppError('La nueva contraseña no puede ser igual a la anterior', 400);
    }

    await userRepository.update(user._id, {
      password: createHash(newPassword),
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
  }
}

export const userService = new UserService();
