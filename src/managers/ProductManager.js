import fs from 'fs/promises';
import path from 'path';

export class ProductManager {
  constructor() {
    this.path = path.join(process.cwd(), 'data', 'products.json');
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getProducts() {
    return await this.#readFile();
  }

  async getProductById(id) {
    const products = await this.#readFile();
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error(`Producto con id ${id} no encontrado`);
    return product;
  }

  async addProduct({ title, description, code, price, status, stock, category, thumbnails }) {
    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      throw new Error('Todos los campos son obligatorios: title, description, code, price, stock, category');
    }

    const products = await this.#readFile();

    if (products.some((p) => p.code === code)) {
      throw new Error(`Ya existe un producto con el código ${code}`);
    }

    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    const newProduct = {
      id: newId,
      title,
      description,
      code,
      price: Number(price),
      status: status !== undefined ? Boolean(status) : true,
      stock: Number(stock),
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
    };

    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) throw new Error(`Producto con id ${id} no encontrado`);

    // No permitir actualizar el id
    delete updateData.id;

    products[index] = { ...products[index], ...updateData };
    await this.#writeFile(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) throw new Error(`Producto con id ${id} no encontrado`);

    const [deleted] = products.splice(index, 1);
    await this.#writeFile(products);
    return deleted;
  }
}
