import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name:  { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  age:        { type: Number, required: true },
  password:   { type: String, required: true },
  cart:       { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role:       { type: String, enum: ['user', 'admin'], default: 'user' },

  // Campos para el flujo de recuperación de contraseña.
  // Se almacena el token y su fecha de expiración (1 hora desde el envío).
  resetPasswordToken:   { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
});

export const UserModel = mongoose.model('User', userSchema);
