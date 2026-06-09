import { Router } from 'express';
import { productService } from '../services/product.service.js';
import { cartService } from '../services/cart.service.js';

const router = Router();

// GET / → Vista estática con lista de productos
router.get('/', async (req, res) => {
  try {
    const result = await productService.getProducts();
    res.render('home', { products: result.payload });
  } catch (error) {
    res.status(500).render('home', { products: [], error: error.message });
  }
});

// GET /realtimeproducts → Vista en tiempo real con WebSockets
router.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productService.getProducts();
    res.render('realTimeProducts', { products: result.payload });
  } catch (error) {
    res.status(500).render('realTimeProducts', { products: [], error: error.message });
  }
});

// GET /products → Vista paginada de productos
router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const result = await productService.getProducts({
      limit: Number(limit),
      page: Number(page),
      sort,
      query
    });
    res.render('products', result);
  } catch (error) {
    res.status(500).render('products', { payload: [], error: error.message });
  }
});

// GET /carts/:cid → Vista de un carrito específico
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.cid);
    res.render('cart', { cart });
  } catch (error) {
    res.status(404).render('cart', { cart: null, error: error.message });
  }
});

export default router;
