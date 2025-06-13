const { registerSchema } = require('../validations/authValidation');
const { hashPassword } = require('../utils/hash');
const {
  saveUser,
  isEmailTaken,
  getUserByEmail,
} = require('../services/userService');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/token');

const register = async (request, h) => {
  const { name, email, password } = request.payload;

  const { error } = registerSchema.validate({ name, email, password });
  if (error) {
    return h.response({ error: true, message: error.message }).code(400);
  }

  if (await isEmailTaken(email)) {
    return h
      .response({ error: true, message: 'Email sudah terdaftar' })
      .code(409);
  }

  const hashed = await hashPassword(password);
  const user = await saveUser({ name, email, password: hashed });

  return h
    .response({ error: false, message: 'User Created', userId: user.id })
    .code(201);
};

const login = async (request, h) => {
  const { email, password } = request.payload;

  const user = await getUserByEmail(email);
  if (!user) {
    return h
      .response({ error: true, message: 'Email tidak ditemukan' })
      .code(404);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return h.response({ error: true, message: 'Password salah' }).code(401);
  }

  const token = generateToken(user);

  return h
    .response({
      error: false,
      message: 'Login berhasil',
      loginResult: {
        userId: user.id,
        name: user.name,
        token: token,
      },
    })
    .code(200);
};

module.exports = { register, login };
