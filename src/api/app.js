const express = require('express');

const { userRoute, loginRoute, recipeRoute } = require('./routes');
const { error } = require('./middlewares');

const app = express();

app.use(express.json());

// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

app.use('/users', userRoute);
app.use('/login', loginRoute);
app.use('/recipes', recipeRoute);

app.use(error);

module.exports = app;
