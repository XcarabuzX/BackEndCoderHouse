import mongoose from 'mongoose';
import { productRepository } from '../repositories/index.js';
import { ProductDTO } from '../dto/product.dto.js';
import { AppError } from '../utils/AppError.js';

/**
 * Lógica de negocio de Productos.
 * Usa el Repository para acceder a los datos y no conoce los detalles del DAO.
 */
class ProductService {
  async getProducts({ limit = 10, page = 1, sort, query } = {}) {
    const filter = {};
    if (query) {
      if (query === 'true' || query === 'false') {
        filter.status = query === 'true';
      } else {
        filter.category = query;
      }
    }

    const sortObj = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

    const { docs, totalDocs } = await productRepository.getPaginated(filter, {
      limit, page, sort: sortObj
    });

    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    const buildLink = (p) => {
      const params = new URLSearchParams({ page: p, limit });
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);
      return `/api/products?${params.toString()}`;
    };

    return {
      status: 'success',
      payload: docs.map((p) => new ProductDTO(p)),
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(page - 1) : null,
      nextLink: hasNextPage ? buildLink(page + 1) : null
    };
  }

  async getProductById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(`ID inválido: ${id}`, 400);
    const product = await productRepository.getById(id);
    if (!product) throw new AppError(`Producto con id ${id} no encontrado`, 404);
    return new ProductDTO(product);
  }

  async createProduct({ title, description, code, price, status, stock, category, thumbnails }) {
    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      throw new AppError('Todos los campos son obligatorios: title, description, code, price, stock, category', 400);
    }
    try {
      const created = await productRepository.create({
        title, description, code,
        price: Number(price),
        status: status !== undefined ? Boolean(status) : true,
        stock: Number(stock),
        category,
        thumbnails: Array.isArray(thumbnails) ? thumbnails : []
      });
      return new ProductDTO(created);
    } catch (error) {
      if (error.code === 11000) throw new AppError(`Ya existe un producto con el código ${code}`, 400);
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(`ID inválido: ${id}`, 400);
    delete updateData._id;
    const updated = await productRepository.update(id, updateData);
    if (!updated) throw new AppError(`Producto con id ${id} no encontrado`, 404);
    return new ProductDTO(updated);
  }

  async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(`ID inválido: ${id}`, 400);
    const deleted = await productRepository.delete(id);
    if (!deleted) throw new AppError(`Producto con id ${id} no encontrado`, 404);
    return new ProductDTO(deleted);
  }
}

export const productService = new ProductService();
