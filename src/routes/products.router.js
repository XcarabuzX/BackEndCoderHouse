import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

// GET /api/products - Listar todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json({ status: 'success', data: products });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/products/:pid - Obtener producto por id
router.get('/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    if (isNaN(pid)) return res.status(400).json({ status: 'error', message: 'ID inválido' });

    const product = await productManager.getProductById(pid);
    res.json({ status: 'success', data: product });
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
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
    const pid = parseInt(req.params.pid);
    if (isNaN(pid)) return res.status(400).json({ status: 'error', message: 'ID inválido' });

    const product = await productManager.updateProduct(pid, req.body);
    res.json({ status: 'success', data: product });
  } catch (error) {
    const status = error.message.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/products/:pid - Eliminar un producto
router.delete('/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    if (isNaN(pid)) return res.status(400).json({ status: 'error', message: 'ID inválido' });

    const product = await productManager.deleteProduct(pid);
    res.json({ status: 'success', message: 'Producto eliminado', data: product });
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
});

export default router;
