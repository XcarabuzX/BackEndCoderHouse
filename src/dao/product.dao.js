import { ProductModel } from '../models/Product.model.js';

/**
 * DAO (Data Access Object) de Productos.
 * Encapsula el acceso a la base de datos. NO contiene lógica de negocio,
 * solo operaciones CRUD sobre el modelo de Mongoose.
 */
export class ProductDAO {
  async getPaginated(filter = {}, options = {}) {
    const { limit = 10, page = 1, sort = {} } = options;
    const [docs, totalDocs] = await Promise.all([
      ProductModel.find(filter).limit(limit).skip((page - 1) * limit).sort(sort).lean(),
      ProductModel.countDocuments(filter)
    ]);
    return { docs, totalDocs };
  }

  async getAll(filter = {}) {
    return ProductModel.find(filter).lean();
  }

  async getById(id) {
    return ProductModel.findById(id);
  }

  async create(data) {
    return ProductModel.create(data);
  }

  async update(id, data) {
    return ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return ProductModel.findByIdAndDelete(id);
  }
}
