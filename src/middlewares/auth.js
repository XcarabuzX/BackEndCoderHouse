import passport from 'passport';

/**
 * Envuelve passport.authenticate para poder usarlo de forma reutilizable
 * y devolver respuestas JSON coherentes ante fallos de autenticación.
 * Deja el usuario autenticado en req.user.
 */
export const passportCall = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: info?.message || 'No autenticado'
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware de autorización por roles.
 * Se usa SIEMPRE después de passportCall('current').
 * Recibe los roles permitidos y bloquea el acceso (403) a cualquier otro.
 *
 *   router.post('/', passportCall('current'), authorize('admin'), handler)
 */
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'No autenticado' });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'No tenés permisos para realizar esta acción'
    });
  }
  next();
};
