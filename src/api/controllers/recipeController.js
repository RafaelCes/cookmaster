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
  const { body } = req;
  const { userId } = req.user;

  const error = validateRequest(body);

  if (error) return next('Invalid entries. Try again.');

  const response = await recipeService.createRecipe(body, userId);

  res.status(201).json(response);
};

const readAllRecipes = async (_req, res) => {
  const response = await recipeService.readAllRecipes();

  res.status(200).json(response);
};

const readRecipeById = async (req, res, next) => {
  const { id } = req.params;

  const response = await recipeService.readRecipeById(id);

  if (!response) return next('recipe not found');

  res.status(200).json(response);
};

const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const { user } = req;

    const error = validateRequest(body);

    if (error) return next('Invalid entries. Try again.');

    const response = await recipeService.updateRecipe(id, body, user);

    if (typeof response === 'string') return next(response);

  res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req;

  const response = await recipeService.deleteRecipe(id, user);

  if (typeof response === 'string') return next(response);

  res.status(204).json();
};

const uploadImage = async (req, res, next) => {
  try {
  const { id } = req.params;
  const { path } = req.file;
  const { user } = req;
  
  const response = await recipeService.uploadImage(id, path, user);

  if (typeof response === 'string') return next(response);

  res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  createRecipe,
  readAllRecipes,
  readRecipeById,
  updateRecipe,
  deleteRecipe,
  uploadImage,
};