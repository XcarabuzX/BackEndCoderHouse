/**
 * Repository de Tickets.
 * Expone al negocio las operaciones de creación y consulta de tickets.
 */
export class TicketRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(data) {
    return this.dao.create(data);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getByCode(code) {
    return this.dao.getByCode(code);
  }
}
