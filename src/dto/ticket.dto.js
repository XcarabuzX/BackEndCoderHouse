/**
 * DTO de Ticket. Representa el comprobante de compra que se devuelve al cliente.
 */
export class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id;
    this.code = ticket.code;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser;
    this.purchase_datetime = ticket.purchase_datetime;
  }
}
