const userModel = require('../models/userModel');

const createUser = async (body) => {
  const itExists = await userModel.checkEmail(body);
  
  if (itExists) {
 return 'Email already registered';
}
  return userModel.createUser(body);
};

const createAdmin = async (body, user) => {
  console.log(user);
  if (user.role !== 'admin') return 'Only admins can register new admins';

  const itExists = await userModel.checkEmail(body);
  
  if (itExists) {
    return 'Email already registered';
  }
  return userModel.createAdmin(body);
};

module.exports = {
  createUser,
  createAdmin,
};