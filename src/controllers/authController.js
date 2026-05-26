const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (error) {
    res.status(400).json({ error: 'Error al registrar usuario.', detalle: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const valido = await bcrypt.compare(password, user.password);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta.' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ mensaje: 'Login exitoso.', token });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor.' });
  }
};