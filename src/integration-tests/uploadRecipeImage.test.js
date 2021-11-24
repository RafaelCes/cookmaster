const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { getConnection } = require('./connectionMock')

const server = require('../api/app');

chai.use(chaiHttp);

const { expect } = chai;

const recipe = {
  name: 'recipe 1',
  ingredients: 'ingredients 1',
  preparation: 'preparation 1',
  userId: '15f46914677df66035f61a355',
};

const recipeNoPermission = {
  name: 'recipe 1',
  ingredients: 'ingredients 1',
  preparation: 'preparation 1',
  userId: '25f46914677df66035f61a355',
};

describe('PUT /recipes/:id/image', function () {
  let connectionMock;
  let token;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    await connectionMock.db('Cookmaster')
      .collection('users')
      .insertOne({
        _id: '15f46914677df66035f61a355',
        name: 'teste',
        email: 'teste@email.com',
        password: 'senhateste',
        role:'user',
      });

    token = await chai.request(server)
      .post('/login')
      .send({
        email: 'teste@email.com',
        password: 'senhateste',
      })
      .then((response) => response.body.token);
  });

  after(async () => {
    await connectionMock.db('Cookmaster')
      .collection('recipes')
      .deleteMany({});

    await connectionMock.db('Cookmaster')
      .collection('users')
      .deleteMany({});
      
    MongoClient.connect.restore();
  });

  describe('quando não é enviado um token', () => {
    let response = {};
    

    before(async function () {
      response = await chai.request(server)
        .put('/recipes/00000000/image');
    });

    it('Espera o codigo de status 401', function () {
      expect(response).to.have.status(401);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('o objeto possui a propriedade "message"', function () {
      expect(response.body).to.have.property('message');
    });
    
    it('a propriedade "message" possui o texto "missing auth token"',
    function () {
      expect(response.body.message)
      .to.be.equal('missing auth token');
    });
  });

  describe('quando o token enviado não esta correto', () => {
    let response = {};

    before(async function () {
      response = await chai.request(server)
        .put('/recipes/00000000/image')
        .set({
          authorization: 'token falso',
        });
    });

    it('Espera o codigo de status 401', function () {
      expect(response).to.have.status(401);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('o objeto possui a propriedade "message"', function () {
      expect(response.body).to.have.property('message');
    });
    
    it('a propriedade "message" possui o texto "jwt malformed"',
    function () {
      expect(response.body.message)
      .to.be.equal('jwt malformed');
    });
  });

  describe('quando o ussuario não tem permissões para alterar a receita',() => {
    let response = {};

    before(async function () {

      const {insertedId} = await connectionMock.db('Cookmaster')
      .collection('recipes')
      .insertOne(recipeNoPermission);

      response = await chai.request(server)
        .put(`/recipes/${insertedId.toString()}/image`)
        .set({
          authorization: token,
        })
        .attach(
          'image', 'src/uploads/ratinho.jpeg'
        );

    });

    it('Espera o codigo de status 403', function () {
      expect(response).to.have.status(403);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('o objeto possui a propriedade "message"', function () {
      expect(response.body).to.have.property('message');
    });
    
    it('a propriedade "message" possui o texto "permission not granted"',
    function () {
      expect(response.body.message)
      .to.be.equal('permission not granted');
    });
  });

  describe('quando a receita não existe no banco de dados', () => {
    let response = {};

    before(async function () {
      response = await chai.request(server)
        .put('/recipes/25f46914677df66035f61a355/image')
        .set({
          authorization: token,
        })
        .attach(
          'image', 'src/uploads/ratinho.jpeg'
        );
    });


    it('Espera o codigo de status 404', function () {
      expect(response).to.have.status(404);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('o objeto possui a propriedade "message"', function () {
      expect(response.body).to.have.property('message');
    });
    
    it('a propriedade "message" possui o texto "recipe not found"',
    function () {
      expect(response.body.message)
      .to.be.equal('recipe not found');
    });
  });

  describe('quando o ussuario não tem permissões para alterar a receita',() => {
    let response = {};

    before(async function () {

      const {insertedId} = await connectionMock.db('Cookmaster')
      .collection('recipes')
      .insertOne(recipe);

      response = await chai.request(server)
        .put(`/recipes/${insertedId.toString()}/image`)
        .set({
          authorization: token,
        })
        .attach(
          'image', 'src/uploads/ratinho.jpeg'
        );

    });

    it('Espera o codigo de status 200', function () {
      expect(response).to.have.status(200);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('retorna u objeto com a receita criada', function () {
      const recipe = response.body;
      expect(recipe).to.be.a('object');
      expect(recipe.name).to.equal('recipe 1');
      expect(recipe.ingredients).to.equal('ingredients 1');
      expect(recipe.preparation).to.equal('preparation 1');
      expect(recipe.userId).to.equal('15f46914677df66035f61a355');
      expect(recipe._id).to.exist;
      expect(recipe.image).to.exist;
    });
  });
});