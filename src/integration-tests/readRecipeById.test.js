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
  userID: '15f46914677df66035f61a355',
};

describe('GET /recipes/:id', function () {
  let connectionMock;
  

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);

  });

  after(async () => {
    await connectionMock.db('Cookmaster')
      .collection('recipes')
      .deleteMany({});
      
    MongoClient.connect.restore();
  });


  describe('quando a receita não existe no banco de dados', () => {

    before(async function () {
      response = await chai.request(server)
        .get('/recipes/0000000000');
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

  describe('quando a receita é encontrada', () => {
    
    before(async function () {
      const {insertedId} = await connectionMock.db('Cookmaster')
      .collection('recipes')
      .insertOne(recipe);

      response = await chai.request(server)
        .get(`/recipes/${insertedId.toString()}`);
    });

    it('Espera o codigo de status 200', function () {
      expect(response).to.have.status(200);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.an('object');
    });
    
    it('retorna a recita buscada', function () {
      expect(response.body).to.have.deep.property('name', 'recipe 1');
      expect(response.body).to.have.deep.property('ingredients', 'ingredients 1');
      expect(response.body).to.have.deep.property('preparation', 'preparation 1');
      expect(response.body).to.have.deep.property('userID', '15f46914677df66035f61a355');
      expect(response.body).to.have.property('_id');
    });
  });
});