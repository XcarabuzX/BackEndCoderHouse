import { UserDTO } from '../dto/user.dto.js';

/**
 * Repository de Usuarios.
 * Además de delegar en el DAO, ofrece un método para obtener el DTO público
 * del usuario, garantizando que la capa de negocio no exponga datos sensibles.
 */
export class UserRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getByEmail(email) {
    return this.dao.getByEmail(email);
  }

  getByResetToken(token) {
    return this.dao.getByResetToken(token);
  }

  create(data) {
    return this.dao.create(data);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }

  /** Devuelve la representación pública (sin datos sensibles) del usuario. */
  toPublicDTO(user) {
    return new UserDTO(user);
  }
}
