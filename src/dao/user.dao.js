import { UserModel } from '../models/User.model.js';

/**
 * DAO de Usuarios. Operaciones CRUD puras sobre el modelo User.
 */
export class UserDAO {
  async getById(id) {
    return UserModel.findById(id);
  }

  async getByEmail(email) {
    return UserModel.findOne({ email });
  }

  async getByResetToken(token) {
    return UserModel.findOne({ resetPasswordToken: token });
  }

  async create(data) {
    return UserModel.create(data);
  }

  async update(id, data) {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }
}
