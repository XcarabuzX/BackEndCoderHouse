import mongoose from 'mongoose';
import { cartRepository, productRepository, ticketRepository } from '../repositories/index.js';
import { TicketDTO } from '../dto/ticket.dto.js';
import { AppError } from '../utils/AppError.js';

/**
 * Lógica de negocio de Carritos, incluyendo el proceso de compra.
 */
class CartService {
  async createCart() {
    return cartRepository.create({ products: [] });
  }

  async getCartById(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new AppError(`ID inválido: ${cid}`, 400);
    const cart = await cartRepository.getByIdPopulated(cid);
    if (!cart) throw new AppError(`Carrito con id ${cid} no encontrado`, 404);
    return cart;
  }

  async addProductToCart(cartId, productId) {
    if (!mongoose.Types.ObjectId.isValid(cartId)) throw new AppError(`ID de carrito inválido: ${cartId}`, 400);
    if (!mongoose.Types.ObjectId.isValid(productId)) throw new AppError(`ID de producto inválido: ${productId}`, 400);

    const cart = await cartRepository.getById(cartId);
    if (!cart) throw new AppError(`Carrito con id ${cartId} no encontrado`, 404);

    const product = await productRepository.getById(productId);
    if (!product) throw new AppError(`Producto con id ${productId} no encontrado`, 404);

    const existingItem = cart.products.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      await cartRepository.incrementQuantity(cartId, productId);
    } else {
      await cartRepository.pushProduct(cartId, productId, 1);
    }

    return cartRepository.getByIdPopulated(cartId);
  }

  async removeProductFromCart(cid, pid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new AppError(`ID de carrito inválido: ${cid}`, 400);
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new AppError(`ID de producto inválido: ${pid}`, 400);
    const cart = await cartRepository.pullProduct(cid, pid);
    if (!cart) throw new AppError(`Carrito con id ${cid} no encontrado`, 404);
    return cart;
  }

  async updateCart(cid, products) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new AppError(`ID inválido: ${cid}`, 400);
    const cart = await cartRepository.update(cid, { products });
    if (!cart) throw new AppError(`Carrito con id ${cid} no encontrado`, 404);
    return cart;
  }

  async updateProductQuantity(cid, pid, quantity) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new AppError(`ID de carrito inválido: ${cid}`, 400);
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new AppError(`ID de producto inválido: ${pid}`, 400);
    const cart = await cartRepository.setQuantity(cid, pid, quantity);
    if (!cart) throw new AppError('Carrito o producto no encontrado', 404);
    return cart;
  }

  async clearCart(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new AppError(`ID inválido: ${cid}`, 400);
    const cart = await cartRepository.update(cid, { products: [] });
    if (!cart) throw new AppError(`Carrito con id ${cid} no encontrado`, 404);
    return cart;
  }

  /**
   * Finaliza la compra de un carrito.
   *  - Verifica el stock de cada producto.
   *  - Los productos con stock suficiente se compran: se descuenta su stock.
   *  - Los productos sin stock suficiente permanecen en el carrito.
   *  - Genera un Ticket con el monto total de lo efectivamente comprado.
   *  - Devuelve el ticket y la lista de productos que no se pudieron comprar.
   */
  async purchaseCart(cid, purchaserEmail) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new AppError(`ID inválido: ${cid}`, 400);

    const cart = await cartRepository.getByIdPopulated(cid);
    if (!cart) throw new AppError(`Carrito con id ${cid} no encontrado`, 404);
    if (cart.products.length === 0) throw new AppError('El carrito está vacío', 400);

    let amount = 0;
    const purchasedProductIds = [];   // ids comprados → se eliminan del carrito
    const notPurchased = [];          // items que no se pudieron comprar (sin stock)

    for (const item of cart.products) {
      const product = item.product;
      // Si el producto fue eliminado de la BD, se considera no comprable.
      if (!product) {
        notPurchased.push({ product: item.product, quantity: item.quantity });
        continue;
      }

      if (product.stock >= item.quantity) {
        // Hay stock suficiente: se descuenta y se suma al monto.
        await productRepository.update(product._id, { stock: product.stock - item.quantity });
        amount += product.price * item.quantity;
        purchasedProductIds.push(product._id.toString());
      } else {
        // Sin stock suficiente: queda en el carrito.
        notPurchased.push({ product: product._id, quantity: item.quantity });
      }
    }

    // Si no se pudo comprar nada, no se genera ticket.
    if (purchasedProductIds.length === 0) {
      throw new AppError('No hay stock suficiente para ninguno de los productos del carrito', 400);
    }

    // El carrito conserva únicamente los productos que NO se pudieron comprar.
    await cartRepository.update(cid, { products: notPurchased });

    const ticket = await ticketRepository.create({
      amount,
      purchaser: purchaserEmail
    });

    return {
      ticket: new TicketDTO(ticket),
      // ids de productos que no se pudieron comprar por falta de stock
      productsNotPurchased: notPurchased.map((i) => i.product?.toString?.() ?? i.product)
    };
  }
}

export const cartService = new CartService();
