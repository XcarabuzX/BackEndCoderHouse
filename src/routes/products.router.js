import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

// GET /api/products - Listar productos con paginación, filtros y ordenamiento
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const result = await productManager.getProducts({
      limit: Number(limit),
      page: Number(page),
      sort,
      query
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/products/:pid - Obtener producto por id
router.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.json({ status: 'success', data: product });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : 404;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

// POST /api/products - Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const product = await productManager.addProduct(req.body);
    res.status(201).json({ status: 'success', data: product });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// PUT /api/products/:pid - Actualizar un producto
router.put('/:pid', async (req, res) => {
  try {
    const product = await productManager.updateProduct(req.params.pid, req.body);
    res.json({ status: 'success', data: product });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : error.message.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/products/:pid - Eliminar un producto
router.delete('/:pid', async (req, res) => {
  try {
    const product = await productManager.deleteProduct(req.params.pid);
    res.json({ status: 'success', message: 'Producto eliminado', data: product });
  } catch (error) {
    const status = error.message.includes('inválido') ? 400 : 404;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

export default router;
