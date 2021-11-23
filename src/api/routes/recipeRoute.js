const recipeRoute = require('express').Router();
const multer = require('multer');

const recipeController = require('../controllers/recipeController');
const authenticate = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => { callback(null, 'src/uploads'); },
  filename: (req, _file, callback) => { callback(null, `${req.params.id}.jpeg`); },
});

const upload = multer({ storage });

recipeRoute.get('/', recipeController.readAllRecipes);
recipeRoute.get('/:id', recipeController.readRecipeById);
recipeRoute.post('/', authenticate, recipeController.createRecipe);
recipeRoute.put('/:id', authenticate, recipeController.updateRecipe);
recipeRoute.put('/:id/image', authenticate, upload.single('image'), recipeController.uploadImage);
recipeRoute.delete('/:id', authenticate, recipeController.deleteRecipe);

module.exports = recipeRoute;