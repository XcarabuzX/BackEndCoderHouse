import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/passport.config.js';

const router = Router();

// ─── POST /api/sessions/register ──────────────────────────────────────────────
// Registra un nuevo usuario. Body requerido: first_name, last_name, email, age, password
router.post('/register', (req, res, next) => {
  passport.authenticate('register', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({ status: 'error', message: info?.message || 'Error al registrar usuario' });
    }
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: user.cart
      }
    });
  })(req, res, next);
});

// ─── POST /api/sessions/login ──────────────────────────────────────────────────
// Autentica al usuario y devuelve un JWT en cookie y en el body
router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ status: 'error', message: info?.message || 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        _id:   user._id,
        email: user.email,
        role:  user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Guardar token en cookie httpOnly (24 h)
    res.cookie('coderCookie', token, {
      maxAge:   24 * 60 * 60 * 1000,
      httpOnly: true
    });

    res.json({
      status:  'success',
      message: 'Login exitoso',
      token
    });
  })(req, res, next);
});

// ─── GET /api/sessions/current ─────────────────────────────────────────────────
// Valida el JWT (desde cookie) y devuelve los datos del usuario autenticado
router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
  res.json({
    status: 'success',
    data: {
      _id:        req.user._id,
      first_name: req.user.first_name,
      last_name:  req.user.last_name,
      email:      req.user.email,
      age:        req.user.age,
      role:       req.user.role,
      cart:       req.user.cart
    }
  });
});

// ─── POST /api/sessions/logout ─────────────────────────────────────────────────
// Limpia la cookie del JWT
router.post('/logout', (req, res) => {
  res.clearCookie('coderCookie');
  res.json({ status: 'success', message: 'Sesión cerrada' });
});

export default router;
