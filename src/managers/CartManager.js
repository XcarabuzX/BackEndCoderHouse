import mongoose from 'mongoose';
import { CartModel } from '../models/Cart.model.js';

export class CartManager {

  async createCart() {
    const newCart = new CartModel({ products: [] });
    return await newCart.save();
  }

  async getCartById(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error(`ID inválido: ${cid}`);
    const cart = await CartModel.findById(cid).populate('products.product');
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);
    return cart;
  }

  async addProductToCart(cartId, productId) {
    if (!mongoose.Types.ObjectId.isValid(cartId)) throw new Error(`ID de carrito inválido: ${cartId}`);
    if (!mongoose.Types.ObjectId.isValid(productId)) throw new Error(`ID de producto inválido: ${productId}`);

    const cart = await CartModel.findById(cartId);
    if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`);

    const existingItem = cart.products.find(
      item => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      await CartModel.findOneAndUpdate(
        { _id: cartId, 'products.product': productId },
        { $inc: { 'products.$.quantity': 1 } }
      );
    } else {
      await CartModel.findByIdAndUpdate(
        cartId,
        { $push: { products: { product: productId, quantity: 1 } } }
      );
    }

    return await CartModel.findById(cartId).populate('products.product');
  }

  async removeProductFromCart(cid, pid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error(`ID de carrito inválido: ${cid}`);
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new Error(`ID de producto inválido: ${pid}`);
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { $pull: { products: { product: pid } } },
      { new: true }
    ).populate('products.product');
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);
    return cart;
  }

  async updateCart(cid, products) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error(`ID inválido: ${cid}`);
    const cart = await CartModel.findByIdAndUpdate(cid, { products }, { new: true }).populate('products.product');
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);
    return cart;
  }

  async updateProductQuantity(cid, pid, quantity) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error(`ID de carrito inválido: ${cid}`);
    if (!mongoose.Types.ObjectId.isValid(pid)) throw new Error(`ID de producto inválido: ${pid}`);
    const cart = await CartModel.findOneAndUpdate(
      { _id: cid, 'products.product': pid },
      { $set: { 'products.$.quantity': quantity } },
      { new: true }
    ).populate('products.product');
    if (!cart) throw new Error(`Carrito o producto no encontrado`);
    return cart;
  }

  async clearCart(cid) {
    if (!mongoose.Types.ObjectId.isValid(cid)) throw new Error(`ID inválido: ${cid}`);
    const cart = await CartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });
    if (!cart) throw new Error(`Carrito con id ${cid} no encontrado`);
    return cart;
  }
}
