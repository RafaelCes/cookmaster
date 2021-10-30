const express = require('express');
const path = require('path');

const { userRoute, loginRoute, recipeRoute } = require('./routes');
const { error } = require('./middlewares');

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/uploads`));

// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador

app.use('/users', userRoute);
app.use('/login', loginRoute);
app.use('/recipes', recipeRoute);
app.get('/images/:id', (req, res) => {
  const { id } = req.params;
  const image = path.join(__dirname, '..', 'uploads', id);
  res.status(200).sendFile(image);
});

app.use(error);

module.exports = app;
