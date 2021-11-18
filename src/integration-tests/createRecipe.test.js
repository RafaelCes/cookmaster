const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { getConnection } = require('./connectionMock')

const server = require('../api/app');

chai.use(chaiHttp);

const { expect } = chai;



describe('POST /recipes', function () {
  let connectionMock;
  let token;  

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

    await connectionMock.db('Cookmaster')
      .collection('users')
      .insertOne({
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
    const DBServer = new MongoMemoryServer();

    before(async function () {
      response = await chai.request(server)
        .post('/recipes');
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
    const DBServer = new MongoMemoryServer();

    before(async function () {
      response = await chai.request(server)
        .post('/recipes')
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

  describe('quando os parametros das requisições estão vazios ou incorretos', () => {
    let response = {};
    const DBServer = new MongoMemoryServer();

    before(async function () {
      response = await chai.request(server)
        .post('/recipes')
        .set({
          authorization: token,
        })
        .send({});
    });

    it('Espera o codigo de status 400', function () {
      expect(response).to.have.status(400);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('o objeto possui a propriedade "message"', function () {
      expect(response.body).to.have.property('message');
    });
    
    it('a propriedade "message" possui o texto "Invalid entries. Try again."',
    function () {
      expect(response.body.message)
      .to.be.equal('Invalid entries. Try again.');
    });
  });


  describe('quando uma receita é criada', () => {
    let response = {};
    const DBServer = new MongoMemoryServer();

    before(async function () {
      response = await chai.request(server)
        .post('/recipes')
        .set({
          authorization: token,
        })
        .send({
          name: "receita teste",
          ingredients: "ingrediente teste",
          preparation: "preparação teste",
        });
    });

    it('Espera o codigo de status 201', function () {
      expect(response).to.have.status(201);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('o objeto possui a propriedade "recipe"', function () {
      expect(response.body).to.have.property('recipe');
    });
    
    it('retorna u objeto com a receita criada', function () {
      const { recipe } = response.body;
      expect(recipe).to.be.a('object');
      expect(recipe.name).to.equal('receita teste');
      expect(recipe.ingredients).to.equal('ingrediente teste');
      expect(recipe.preparation).to.equal('preparação teste');
      expect(recipe.userId).to.exist;
      expect(recipe._id).to.exist;
    });
  });

});