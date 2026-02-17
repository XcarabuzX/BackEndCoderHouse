import { Router } from 'express';
import { CartManager } from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager();

// POST /api/carts - Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).json({ status: 'success', data: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/carts/:cid - Obtener carrito por id
router.get('/:cid', async (req, res) => {
  try {
    const cid = parseInt(req.params.cid);
    if (isNaN(cid)) return res.status(400).json({ status: 'error', message: 'ID de carrito inválido' });

    const cart = await cartManager.getCartById(cid);
    res.json({ status: 'success', data: cart });
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    if (isNaN(cid) || isNaN(pid)) {
      return res.status(400).json({ status: 'error', message: 'IDs inválidos' });
    }

    const cart = await cartManager.addProductToCart(cid, pid);
    res.json({ status: 'success', message: 'Producto agregado al carrito', data: cart });
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
});

export default router;
