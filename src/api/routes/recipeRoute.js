const recipeRoute = require('express').Router();

const recipeController = require('../controllers/recipeController');
const authenticate = require('../middlewares/auth');

recipeRoute.get('/', recipeController.readAllRecipes);
recipeRoute.get('/:id', recipeController.readRecipeById);
recipeRoute.post('/', authenticate, recipeController.createRecipe);

module.exports = recipeRoute;