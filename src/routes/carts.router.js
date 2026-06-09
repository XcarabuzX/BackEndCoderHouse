import { Router } from 'express';
import { CartsController } from '../controllers/carts.controller.js';
import { passportCall, authorize } from '../middlewares/auth.js';

const router = Router();

router.post('/', CartsController.create);
router.get('/:cid', passportCall('current'), CartsController.getById);

// ─── Agregar producto al carrito: solo USUARIO ─────────────────────────────
// La consigna pide que únicamente el usuario (rol "user") pueda agregar
// productos a su carrito.
router.post('/:cid/product/:pid', passportCall('current'), authorize('user'), CartsController.addProduct);

router.put('/:cid/products/:pid', passportCall('current'), authorize('user'), CartsController.updateQuantity);
router.put('/:cid', passportCall('current'), authorize('user'), CartsController.replaceProducts);
router.delete('/:cid/products/:pid', passportCall('current'), authorize('user'), CartsController.removeProduct);
router.delete('/:cid', passportCall('current'), authorize('user'), CartsController.clear);

// ─── Finalizar compra: solo USUARIO ────────────────────────────────────────
router.post('/:cid/purchase', passportCall('current'), authorize('user'), CartsController.purchase);

export default router;
