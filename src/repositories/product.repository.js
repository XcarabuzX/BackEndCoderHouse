/**
 * Repository de Productos.
 * Capa intermedia entre la lógica de negocio (services) y el acceso a datos (DAO).
 * Recibe un DAO por inyección de dependencias, lo que permite cambiar la fuente
 * de datos sin modificar la lógica de negocio.
 */
export class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getPaginated(filter, options) {
    return this.dao.getPaginated(filter, options);
  }

  getAll(filter) {
    return this.dao.getAll(filter);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  create(data) {
    return this.dao.create(data);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }

  delete(id) {
    return this.dao.delete(id);
  }
}
