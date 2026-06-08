import { cartService } from '../services/cart.service.js';
import { AppError } from '../utils/AppError.js';

/** Controller de Carritos, incluyendo el endpoint de compra. */
export class CartsController {
  static async create(req, res, next) {
    try {
      const cart = await cartService.createCart();
      res.status(201).json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const cart = await cartService.getCartById(req.params.cid);
      res.json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async addProduct(req, res, next) {
    try {
      const cart = await cartService.addProductToCart(req.params.cid, req.params.pid);
      res.json({ status: 'success', message: 'Producto agregado al carrito', data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuantity(req, res, next) {
    try {
      const { quantity } = req.body;
      if (quantity === undefined || isNaN(Number(quantity))) {
        throw new AppError('Se requiere quantity numérico en el body', 400);
      }
      const cart = await cartService.updateProductQuantity(
        req.params.cid, req.params.pid, Number(quantity)
      );
      res.json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async replaceProducts(req, res, next) {
    try {
      const { products } = req.body;
      if (!Array.isArray(products)) {
        throw new AppError('Se requiere un array de products en el body', 400);
      }
      const cart = await cartService.updateCart(req.params.cid, products);
      res.json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async removeProduct(req, res, next) {
    try {
      const cart = await cartService.removeProductFromCart(req.params.cid, req.params.pid);
      res.json({ status: 'success', message: 'Producto eliminado del carrito', data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async clear(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.params.cid);
      res.json({ status: 'success', message: 'Carrito vaciado', data: cart });
    } catch (error) {
      next(error);
    }
  }

  static async purchase(req, res, next) {
    try {
      // Solo el dueño del carrito (o un admin) debería poder comprarlo.
      const { cid } = req.params;
      if (req.user.role !== 'admin' && req.user.cart?.toString() !== cid) {
        throw new AppError('Solo podés comprar tu propio carrito', 403);
      }
      const result = await cartService.purchaseCart(cid, req.user.email);
      res.json({
        status: 'success',
        message: result.productsNotPurchased.length
          ? 'Compra parcial: algunos productos no tenían stock suficiente'
          : 'Compra realizada con éxito',
        ticket: result.ticket,
        productsNotPurchased: result.productsNotPurchased
      });
    } catch (error) {
      next(error);
    }
  }
}
