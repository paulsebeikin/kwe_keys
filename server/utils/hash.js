const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

module.exports = { hashPassword };
