import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User.model.js';
import { CartModel } from '../models/Cart.model.js';

export const JWT_SECRET = 'coderHouseSecret2024';

// Extrae el JWT desde la cookie 'coderCookie'
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['coderCookie'];
  }
  return token;
};

export const initializePassport = () => {
  // ─── Estrategia REGISTER ───────────────────────────────────────────────────
  passport.use(
    'register',
    new LocalStrategy(
      { passReqToCallback: true, usernameField: 'email' },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, age } = req.body;

          // Verificar si el usuario ya existe
          const existingUser = await UserModel.findOne({ email: username });
          if (existingUser) {
            return done(null, false, { message: 'El email ya está registrado' });
          }

          // Crear un carrito vacío para el nuevo usuario
          const newCart = await CartModel.create({ products: [] });

          // Encriptar la contraseña con bcrypt.hashSync
          const hashedPassword = bcrypt.hashSync(password, 10);

          const newUser = await UserModel.create({
            first_name,
            last_name,
            email: username,
            age: Number(age),
            password: hashedPassword,
            cart: newCart._id,
            role: 'user'
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // ─── Estrategia LOGIN ──────────────────────────────────────────────────────
  passport.use(
    'login',
    new LocalStrategy(
      { usernameField: 'email' },
      async (username, password, done) => {
        try {
          const user = await UserModel.findOne({ email: username });
          if (!user) {
            return done(null, false, { message: 'Usuario no encontrado' });
          }

          const isValid = bcrypt.compareSync(password, user.password);
          if (!isValid) {
            return done(null, false, { message: 'Contraseña incorrecta' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // ─── Estrategia CURRENT (JWT) ──────────────────────────────────────────────
  passport.use(
    'current',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: JWT_SECRET
      },
      async (jwtPayload, done) => {
        try {
          const user = await UserModel.findById(jwtPayload._id);
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
