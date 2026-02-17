import fs from 'fs/promises';
import path from 'path';

export class CartManager {
  constructor() {
    this.path = path.join(process.cwd(), 'data', 'carts.json');
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

  async createCart() {
    const carts = await this.#readFile();
    const newId = carts.length > 0 ? Math.max(...carts.map((c) => c.id)) + 1 : 1;

    const newCart = {
      id: newId,
      products: [],
    };

    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.#readFile();
    const cart = carts.find((c) => c.id === id);
    if (!cart) throw new Error(`Carrito con id ${id} no encontrado`);
    return cart;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.#readFile();
    const cartIndex = carts.findIndex((c) => c.id === cartId);

    if (cartIndex === -1) throw new Error(`Carrito con id ${cartId} no encontrado`);

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex((p) => p.product === productId);

    if (productIndex !== -1) {
      // Producto ya existe en el carrito, incrementar quantity
      cart.products[productIndex].quantity += 1;
    } else {
      // Producto nuevo, agregar con quantity 1
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this.#writeFile(carts);
    return cart;
  }
}
