import bcrypt from 'bcrypt';

/** Genera el hash de una contraseña en texto plano. */
export const createHash = (password) => bcrypt.hashSync(password, 10);

/** Compara una contraseña en texto plano contra un hash almacenado. */
export const isValidPassword = (password, hash) => bcrypt.compareSync(password, hash);
