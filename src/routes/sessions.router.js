import { Router } from 'express';
import { SessionsController } from '../controllers/sessions.controller.js';
import { passportCall } from '../middlewares/auth.js';

const router = Router();

router.post('/register', SessionsController.register);
router.post('/login', SessionsController.login);

// GET /current — valida el JWT (estrategia "current") y devuelve un DTO seguro.
router.get('/current', passportCall('current'), SessionsController.current);

router.post('/logout', SessionsController.logout);

// ─── Recuperación de contraseña ────────────────────────────────────────────
router.post('/forgot-password', SessionsController.requestPasswordReset);
router.post('/reset-password', SessionsController.resetPassword);

export default router;
