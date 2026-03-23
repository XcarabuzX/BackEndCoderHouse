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

// GET /api/carts/:cid - Obtener carrito por id (con populate)
router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.json({ status: 'success', data: cart });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : 404;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', message: 'Producto agregado al carrito', data: cart });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : 404;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || isNaN(Number(quantity))) {
      return res.status(400).json({ status: 'error', message: 'Se requiere quantity numérico en el body' });
    }
    const cart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, Number(quantity));
    res.json({ status: 'success', data: cart });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : 404;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

// PUT /api/carts/:cid - Reemplazar todos los productos del carrito
router.put('/:cid', async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', message: 'Se requiere un array de products en el body' });
    }
    const cart = await cartManager.updateCart(req.params.cid, products);
    res.json({ status: 'success', data: cart });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : 404;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/carts/:cid/products/:pid - Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', message: 'Producto eliminado del carrito', data: cart });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : 404;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/carts/:cid - Vaciar carrito
router.delete('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.clearCart(req.params.cid);
    res.json({ status: 'success', message: 'Carrito vaciado', data: cart });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : 404;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

export default router;
