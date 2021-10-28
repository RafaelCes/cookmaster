const joi = require('joi');

const recipeService = require('../services/recipeService');

const validateRequest = (body) => {
  const { error } = joi.object({
    name: joi.string().required(),
    ingredients: joi.string().required(),
    preparation: joi.string().required(),
  }).validate(body);
  return error;
};

const createRecipe = async (req, res, next) => {
  const { body, user } = req;

  const error = validateRequest(body);

  if (error) return next('Invalid entries. Try again.');

  const response = await recipeService.createRecipe(body, user);

  res.status(201).json(response);
};

const readAllRecipes = async (_req, res) => {
  const response = await recipeService.readAllRecipes();

  res.status(200).json(response);
};

module.exports = {
  createRecipe,
  readAllRecipes,
};