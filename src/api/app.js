const express = require('express');

const { userRoute } = require('./routes');
const { error } = require('./middlewares');

const app = express();

app.use(express.json());

// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

app.use('/users', userRoute);

app.use(error);

module.exports = app;
