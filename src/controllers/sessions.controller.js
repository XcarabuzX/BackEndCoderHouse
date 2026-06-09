import jwt from 'jsonwebtoken';
import { userService } from '../services/user.service.js';
import { config } from '../config/config.js';

/** Controller de Sesiones: registro, login, current (DTO), logout y recuperación. */
export class SessionsController {
  static async register(req, res, next) {
    try {
      const user = await userService.register(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        // Se devuelve el DTO público, nunca el documento con datos sensibles.
        data: userService.getPublicProfile(user)
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await userService.validateLogin(email, password);

      const token = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.cookie(config.jwt.cookieName, token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
      });

      res.json({ status: 'success', message: 'Login exitoso', token });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /current — Devuelve un DTO con información NO sensible del usuario.
   * Nunca expone password ni tokens de recuperación.
   */
  static current(req, res) {
    res.json({
      status: 'success',
      data: userService.getPublicProfile(req.user)
    });
  }

  static logout(req, res) {
    res.clearCookie(config.jwt.cookieName);
    res.json({ status: 'success', message: 'Sesión cerrada' });
  }

  // ─── Recuperación de contraseña ────────────────────────────────────────────

  static async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ status: 'error', message: 'El email es requerido' });
      }
      await userService.requestPasswordReset(email);
      // Respuesta neutra para no revelar si el email existe.
      res.json({
        status: 'success',
        message: 'Si el email está registrado, recibirás un correo con instrucciones para restablecer tu contraseña.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await userService.resetPassword(token, password);
      res.json({ status: 'success', message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      next(error);
    }
  }
}
