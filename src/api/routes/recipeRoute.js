const recipeRoute = require('express').Router();

const recipeController = require('../controllers/recipeController');
const authenticate = require('../middlewares/auth');

recipeRoute.get('/', recipeController.readAllRecipes);
recipeRoute.get('/:id', recipeController.readRecipeById);
recipeRoute.post('/', authenticate, recipeController.createRecipe);
recipeRoute.put('/:id', authenticate, recipeController.updateRecipe);
recipeRoute.delete('/:id', authenticate, recipeController.deleteRecipe);

module.exports = recipeRoute;