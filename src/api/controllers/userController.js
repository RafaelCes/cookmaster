const joi = require('joi');

const userService = require('../services/userService');

const validateBody = (body) => {
  const { error } = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string(),
  }).validate(body);
  return error;
};

const createUser = async (req, res, next) => {
  const { body } = req;
  const error = validateBody(body);
  
  if (error) return next(error);
  
  const response = await userService.createUser(body);

  if (response.status) return next(response);
  
  res.status(201).json(response);
};

module.exports = {
  createUser,
};