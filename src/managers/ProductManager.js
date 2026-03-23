import mongoose from 'mongoose';
import { ProductModel } from '../models/Product.model.js';

export class ProductManager {

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

    const [products, totalDocs] = await Promise.all([
      ProductModel.find(filter).limit(limit).skip((page - 1) * limit).sort(sortObj),
      ProductModel.countDocuments(filter)
    ]);

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
      payload: products,
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
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error(`ID inválido: ${id}`);
    const product = await ProductModel.findById(id);
    if (!product) throw new Error(`Producto con id ${id} no encontrado`);
    return product;
  }

  async addProduct({ title, description, code, price, status, stock, category, thumbnails }) {
    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      throw new Error('Todos los campos son obligatorios: title, description, code, price, stock, category');
    }
    try {
      const newProduct = new ProductModel({
        title, description, code,
        price: Number(price),
        status: status !== undefined ? Boolean(status) : true,
        stock: Number(stock),
        category,
        thumbnails: Array.isArray(thumbnails) ? thumbnails : []
      });
      return await newProduct.save();
    } catch (error) {
      if (error.code === 11000) throw new Error(`Ya existe un producto con el código ${code}`);
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error(`ID inválido: ${id}`);
    delete updateData._id;
    const updated = await ProductModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) throw new Error(`Producto con id ${id} no encontrado`);
    return updated;
  }

  async deleteProduct(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error(`ID inválido: ${id}`);
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) throw new Error(`Producto con id ${id} no encontrado`);
    return deleted;
  }
}
