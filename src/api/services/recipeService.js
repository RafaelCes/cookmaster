const { ObjectId } = require('mongodb');

const recipeModel = require('../models/recipeModel');

const checkPermission = async (id, user) => {
  const recipe = await recipeModel.readRecipeById(id);

  if (!recipe) return 'recipe not found';
  if (user.role !== 'admin' && recipe.userId.toString() !== user.userId) {
    return 'permission not granted';
  }
  return null;
};

const createRecipe = async (body, userId) => {
  const response = await recipeModel.creatRecipe(body, userId);

  return response;
};

const readAllRecipes = async () => recipeModel.readAllRecipes();

const readRecipeById = async (id) => {
  if (!ObjectId.isValid(id)) return null;

  return recipeModel.readRecipeById(id);
};

const updateRecipe = async (id, body, user) => {
  if (!ObjectId.isValid(id)) return 'recipe not found';

  const permission = await checkPermission(id, user);

  if (permission) return permission;

  const result = await recipeModel.updateRecipe(id, body);
  result.userId = user.userId;
  return result; 
};

const deleteRecipe = async (id, user) => {
  const permission = await checkPermission(id, user);

  if (permission) return permission;

  return recipeModel.deleteRecipe(id);
};

const uploadImage = async (id, path, user) => {
  const permission = await checkPermission(id, user);

  if (permission) return permission;

  await recipeModel.uploadImage(id, path);
  
  return recipeModel.readRecipeById(id);
};

module.exports = {
  createRecipe,
  readAllRecipes,
  readRecipeById,
  updateRecipe,
  deleteRecipe,
  uploadImage,
};