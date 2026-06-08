import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { userRepository } from '../repositories/index.js';
import { config } from './config.js';

// Extrae el JWT desde la cookie configurada por entorno.
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[config.jwt.cookieName];
  }
  return token;
};

export const initializePassport = () => {
  // ─── Estrategia CURRENT (JWT) ──────────────────────────────────────────────
  // Es la estrategia con la que trabaja el middleware de autorización por roles.
  passport.use(
    'current',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.jwt.secret
      },
      async (jwtPayload, done) => {
        try {
          const user = await userRepository.getById(jwtPayload._id);
          if (!user) {
            return done(null, false, { message: 'Usuario no encontrado' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
