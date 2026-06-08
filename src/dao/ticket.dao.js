import { TicketModel } from '../models/Ticket.model.js';

/**
 * DAO de Tickets. Operaciones CRUD puras sobre el modelo Ticket.
 */
export class TicketDAO {
  async create(data) {
    return TicketModel.create(data);
  }

  async getById(id) {
    return TicketModel.findById(id);
  }

  async getByCode(code) {
    return TicketModel.findOne({ code });
  }
}
