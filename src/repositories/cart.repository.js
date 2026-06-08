/**
 * Repository de Carritos.
 * Expone al negocio las operaciones sobre carritos delegando en el DAO.
 */
export class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(data) {
    return this.dao.create(data);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getByIdPopulated(id) {
    return this.dao.getByIdPopulated(id);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }

  incrementQuantity(cartId, productId) {
    return this.dao.incrementQuantity(cartId, productId);
  }

  pushProduct(cartId, productId, quantity) {
    return this.dao.pushProduct(cartId, productId, quantity);
  }

  setQuantity(cartId, productId, quantity) {
    return this.dao.setQuantity(cartId, productId, quantity);
  }

  pullProduct(cartId, productId) {
    return this.dao.pullProduct(cartId, productId);
  }
}
