import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

// GET / → Vista estática con lista de productos
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', { products });
  } catch (error) {
    res.status(500).render('home', { products: [], error: error.message });
  }
});

// GET /realtimeproducts → Vista en tiempo real con WebSockets
router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products });
  } catch (error) {
    res.status(500).render('realTimeProducts', { products: [], error: error.message });
  }
});

export default router;
