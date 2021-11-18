const userModel = require('../models/userModel');

const createUser = async (body) => {
  const itExists = await userModel.checkEmail(body);
  
  if (itExists) {
 return 'Email already registered';
}
  return userModel.createUser(body, 'user');
};

const createAdmin = async (body, user) => {
  if (user.role !== 'admin') return 'Only admins can register new admins';

  const itExists = await userModel.checkEmail(body);
  
  if (itExists) {
    return 'Email already registered';
  }
  return userModel.createUser(body, 'admin');
};

module.exports = {
  createUser,
  createAdmin,
};