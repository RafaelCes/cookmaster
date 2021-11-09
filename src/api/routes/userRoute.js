const userRoute = require('express').Router();

const userController = require('../controllers/userController');
const authenticate = require('../middlewares/auth');

userRoute.post('/', userController.createUser);
userRoute.post('/admin', authenticate, userController.createAdmin);

module.exports = userRoute;