const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { getConnection } = require('./connectionMock')

const server = require('../api/app');

chai.use(chaiHttp);

const { expect } = chai;

const recipes = [{
  name: 'recipe 1',
  ingredients: 'ingredients 1',
  preparation: 'preparation 1',
  userID: '15f46914677df66035f61a355',
},{
name: 'recipe 2',
ingredients: 'ingredients 2',
preparation: 'preparation 2',
userID: '25f46914677df66035f61a355',
}]

describe('GET /recipes', function () {
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

  describe('quando não existem receitas no banco de dados', () => {
    
    before(async function () {
      response = await chai.request(server)
        .get('/recipes');
    });

    it('Espera o codigo de status 200', function () {
      expect(response).to.have.status(200);
    });
    it('retorna um array', function () {
      expect(response.body).to.be.an('array');
    });
    
    it('o array está vazio', function () {
      expect(response.body).to.be.empty;
    });
    
  });

  describe('quando existem receitas no banco de dados', () => {
    
    before(async function () {
      await connectionMock.db('Cookmaster')
      .collection('recipes')
      .insertMany(recipes);

      response = await chai.request(server)
        .get('/recipes');
    });

    it('Espera o codigo de status 200', function () {
      expect(response).to.have.status(200);
    });
    it('retorna um array', function () {
      expect(response.body).to.be.an('array');
    });
    
    it('retorna todas as receitas no banco de dados', function () {
      expect(response.body[0]).to.have.deep.property('name', 'recipe 1');
      expect(response.body[1]).to.have.deep.property('name', 'recipe 2');
      expect(response.body[0]).to.have.deep.property('ingredients', 'ingredients 1');
      expect(response.body[1]).to.have.deep.property('ingredients', 'ingredients 2');
      expect(response.body[0]).to.have.deep.property('preparation', 'preparation 1');
      expect(response.body[1]).to.have.deep.property('preparation', 'preparation 2');
      expect(response.body[0]).to.have.deep.property('userID', '15f46914677df66035f61a355');
      expect(response.body[1]).to.have.deep.property('userID', '25f46914677df66035f61a355');
      expect(response.body[0]).to.have.property('_id');
      expect(response.body[1]).to.have.property('_id');
    });
    
  });
});