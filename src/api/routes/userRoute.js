const userRoute = require('express').Router();

const userController = require('../controllers/userController');

userRoute.post('/', userController.createUser);

module.exports = userRoute;