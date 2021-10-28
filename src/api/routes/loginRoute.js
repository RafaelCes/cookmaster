const loginRoute = require('express').Router();

const loginController = require('../controllers/loginController');

loginRoute.post('/', loginController.userLogin);

module.exports = loginRoute;