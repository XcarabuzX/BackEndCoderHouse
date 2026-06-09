import { CartModel } from '../models/Cart.model.js';

/**
 * DAO de Carritos. Operaciones CRUD puras sobre el modelo Cart.
 */
export class CartDAO {
  async create(data = { products: [] }) {
    return CartModel.create(data);
  }

  async getById(id) {
    return CartModel.findById(id);
  }

  async getByIdPopulated(id) {
    return CartModel.findById(id).populate('products.product');
  }

  async update(id, data) {
    return CartModel.findByIdAndUpdate(id, data, { new: true }).populate('products.product');
  }

  async incrementQuantity(cartId, productId) {
    return CartModel.findOneAndUpdate(
      { _id: cartId, 'products.product': productId },
      { $inc: { 'products.$.quantity': 1 } }
    );
  }

  async pushProduct(cartId, productId, quantity = 1) {
    return CartModel.findByIdAndUpdate(
      cartId,
      { $push: { products: { product: productId, quantity } } }
    );
  }

  async setQuantity(cartId, productId, quantity) {
    return CartModel.findOneAndUpdate(
      { _id: cartId, 'products.product': productId },
      { $set: { 'products.$.quantity': quantity } },
      { new: true }
    ).populate('products.product');
  }

  async pullProduct(cartId, productId) {
    return CartModel.findByIdAndUpdate(
      cartId,
      { $pull: { products: { product: productId } } },
      { new: true }
    ).populate('products.product');
  }
}
