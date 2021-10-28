const { ObjectId } = require('mongodb');

const recipeModel = require('../models/recipeModel');

const createRecipe = async (body, user) => {
  const response = await recipeModel.creatRecipe(body, user.id);

  return response;
};

const readAllRecipes = async () => recipeModel.readAllRecipes();

const readRecipeById = async (id) => {
  if (!ObjectId.isValid(id)) return null;

  return recipeModel.readRecipeById(id);
};

module.exports = {
  createRecipe,
  readAllRecipes,
  readRecipeById,
};