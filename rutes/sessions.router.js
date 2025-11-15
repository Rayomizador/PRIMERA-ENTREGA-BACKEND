import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userManager } from '../managers/UserManager.js';
import { cartManager } from '../managers/CartManager.js';
import { ENV } from '../config/env.js';

const router = Router();
const JWT_SECRET = ENV.JWT_SECRET;
const JWT_EXPIRES = ENV.JWT_EXPIRES;

// Register
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;

    // Create a cart for user
    const cart = await cartManager.createCart();

    const user = await userManager.createUser({
      first_name,
      last_name,
      email,
      age,
      password,
      cart: cart.id,
      role: role || 'user'
    });

    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login (Passport Local) -> returns JWT and sets cookie
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('jwt', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    return res.status(200).json({ token, user });
  })(req, res, next);
});

// Current - validates JWT
router.get('/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
  res.status(200).json({ user: req.user });
});

// Logout - clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Sesión cerrada' });
});

export default router;
