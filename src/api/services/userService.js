const userModel = require('../models/userModel');

const createUser = async (body) => {
  const itExists = await userModel.checkEmail(body);
  if (itExists) {
 return { 
  status: 409,
}; 
}
  return userModel.createUser(body);
};

module.exports = {
  createUser,
};