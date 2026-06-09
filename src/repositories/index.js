import { ProductDAO } from '../dao/product.dao.js';
import { CartDAO } from '../dao/cart.dao.js';
import { UserDAO } from '../dao/user.dao.js';
import { TicketDAO } from '../dao/ticket.dao.js';

import { ProductRepository } from './product.repository.js';
import { CartRepository } from './cart.repository.js';
import { UserRepository } from './user.repository.js';
import { TicketRepository } from './ticket.repository.js';

/**
 * Punto único de ensamblado de la capa de persistencia.
 * Aquí se inyectan los DAOs concretos (Mongo) dentro de cada Repository.
 * Si en el futuro se cambia el motor de persistencia (p. ej. memoria o SQL),
 * solo se modifican los DAOs importados aquí, sin tocar la lógica de negocio.
 */
export const productRepository = new ProductRepository(new ProductDAO());
export const cartRepository = new CartRepository(new CartDAO());
export const userRepository = new UserRepository(new UserDAO());
export const ticketRepository = new TicketRepository(new TicketDAO());
