const jwt = require('jsonwebtoken');

const generateToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET || 'fallback_secret_key_12345', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
