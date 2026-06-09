/**
 * DTO (Data Transfer Object) de Usuario.
 * Expone únicamente la información NO sensible del usuario.
 * Se omiten deliberadamente: password, resetPasswordToken y resetPasswordExpires.
 * Se usa, entre otros, en la ruta GET /api/sessions/current.
 */
export class UserDTO {
  constructor(user) {
    this.id = user._id;
    this.full_name = `${user.first_name} ${user.last_name}`;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.cart = user.cart;
  }
}
