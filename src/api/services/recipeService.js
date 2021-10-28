const recipeModel = require('../models/recipeModel');

const createRecipe = async (body, user) => {
  const response = await recipeModel.creatRecipe(body, user.id);

  return response;
};

const readAllRecipes = async () => recipeModel.readAllRecipes();

module.exports = {
  createRecipe,
  readAllRecipes,
};