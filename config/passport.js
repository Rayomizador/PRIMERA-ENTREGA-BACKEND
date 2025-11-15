import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import { userManager } from '../managers/UserManager.js';
import { ENV } from './env.js';

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  return token;
};

export default function initializePassport() {
  const JWT_SECRET = ENV.JWT_SECRET;

  // Local strategy for login (email + password)
  passport.use('local', new LocalStrategy({ usernameField: 'email', passwordField: 'password', session: false }, async (email, password, done) => {
    try {
      const user = await userManager.getByEmail(email);
      if (!user) return done(null, false, { message: 'Credenciales inválidas' });

      // userManager stores hashed password; need to fetch full user with password
      const stored = await userManager.getAll();
      const full = stored.find(u => u.email === email);
      if (!full) return done(null, false, { message: 'Credenciales inválidas' });

      const ok = bcrypt.compareSync(password, full.password);
      if (!ok) return done(null, false, { message: 'Credenciales inválidas' });

      const { password: _, ...safe } = full;
      return done(null, safe);
    } catch (err) {
      return done(err);
    }
  }));

  // JWT strategy to protect routes
  passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      cookieExtractor
    ]),
    secretOrKey: JWT_SECRET
  }, async (payload, done) => {
    try {
      const user = await userManager.getById(payload.id);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }));
}
