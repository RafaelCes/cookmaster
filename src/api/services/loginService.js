const jwt = require('jsonwebtoken');

const userModel = require('../models/userModel');

const jwtSecret = 'cant you appprehend not being bound by anything is the greatest limitation';

const validateLogin = async (req) => {
  const user = await userModel.readUser(req);

  if (!user) return null;
  const { _id: id } = user;
  const payload = {
    id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, jwtSecret);

  return token;
};

module.exports = {
  validateLogin,
};