const joi = require('joi');

const userService = require('../services/userService');

const validateRequest = (body) => {
  const { error } = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string(),
  }).validate(body);
  return error;
};

const createUser = async (req, res, next) => {
  const { body } = req;
  const error = validateRequest(body);
  
  if (error) return next('Invalid entries. Try again.');
  
  const response = await userService.createUser(body);

  if (typeof response === 'string') return next(response);
  
  res.status(201).json(response);
};

const createAdmin = async (req, res, next) => {
  const { body, user } = req; 
  const error = validateRequest(body);
  
  if (error) return next('Invalid entries. Try again.');
  
  const response = await userService.createAdmin(body, user);

  if (typeof response === 'string') return next(response);
  
  res.status(201).json(response);
};

module.exports = {
  createUser,
  createAdmin,
};