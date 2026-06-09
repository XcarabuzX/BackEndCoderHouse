import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller.js';
import { passportCall, authorize } from '../middlewares/auth.js';

const router = Router();

// ─── Lectura: pública ──────────────────────────────────────────────────────
router.get('/', ProductsController.getAll);
router.get('/:pid', ProductsController.getById);

// ─── Escritura: solo ADMIN ─────────────────────────────────────────────────
// Trabaja junto a la estrategia "current": primero autentica, luego autoriza por rol.
router.post('/', passportCall('current'), authorize('admin'), ProductsController.create);
router.put('/:pid', passportCall('current'), authorize('admin'), ProductsController.update);
router.delete('/:pid', passportCall('current'), authorize('admin'), ProductsController.remove);

export default router;
