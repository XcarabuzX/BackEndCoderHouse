import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ticketSchema = new mongoose.Schema({
  // Código único autogenerado del ticket de compra.
  code: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  purchase_datetime: {
    type: Date,
    default: () => new Date()
  },
  amount: {
    type: Number,
    required: true
  },
  // Email del usuario que realizó la compra.
  purchaser: {
    type: String,
    required: true
  }
});

export const TicketModel = mongoose.model('Ticket', ticketSchema);
