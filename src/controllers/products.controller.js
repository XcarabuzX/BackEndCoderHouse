import { productService } from '../services/product.service.js';

/** Controller de Productos: traduce HTTP ↔ lógica de negocio (service). */
export class ProductsController {
  static async getAll(req, res, next) {
    try {
      const { limit = 10, page = 1, sort, query } = req.query;
      const result = await productService.getProducts({
        limit: Number(limit), page: Number(page), sort, query
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.pid);
      res.json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.pid, req.body);
      res.json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req, res, next) {
    try {
      const product = await productService.deleteProduct(req.params.pid);
      res.json({ status: 'success', message: 'Producto eliminado', data: product });
    } catch (error) {
      next(error);
    }
  }
}
