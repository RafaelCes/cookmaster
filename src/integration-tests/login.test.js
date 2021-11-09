const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { getConnection } = require('./connectionMock')
const jwt = require('jsonwebtoken');

const jwtSecret = 'cant you appprehend not being bound by anything is the greatest limitation';

const server = require('../api/app');

chai.use(chaiHttp);

const { expect } = chai;

describe('POST /users', function () {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    await connectionMock.db('Cookmaster')
      .collection('users')
      .deleteMany({});
    MongoClient.connect.restore();
  });

  describe('Quando os campos não estão preenchidos',() => {
    let response;
    before(async () => {
      response = await chai.request(server)
        .post('/login')
        .send({});
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
    
    it('a propriedade "message" possui o texto "All fields must be filled"',
    function () {
      expect(response.body.message)
      .to.be.equal('All fields must be filled');
    });
  });

  describe('Quando as credenciais estão erradas',() => {
    let response;
    before(async () => {
      response = await chai.request(server)
        .post('/login')
        .send({
          email: 'teste@email.com',
          password: 'senhateste',
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
    
    it('a propriedade "message" possui o texto "Incorrect username or password"',
    function () {
      expect(response.body.message)
      .to.be.equal('Incorrect username or password');
    });
  });

  describe('Quando o login é efetuado com sucesso', () => {
    let response = {};

    before(async function () {
      await connectionMock.db('Cookmaster')
      .collection('users')
      .insertOne({
        name: 'teste',
        email: 'teste@email.com',
        password: 'senhateste',
        role:'user',
      });

      response = await chai.request(server)
        .post('/login')
        .send({
          email: 'teste@email.com',
          password: 'senhateste',
        });
    });
    
    it('Espera o codigo de status 200', function () {
      expect(response).to.have.status(200);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('o objeto possui a propriedade "token"', function () {
      expect(response.body).to.have.property('token');
    });
    
    it('o token retornado é valido', function () {
      const { token } = response.body;
      const payload = jwt.verify(token, jwtSecret);
      console.log(payload);
      expect(payload).to.be.a('object');
      expect(payload.email).to.equal('teste@email.com');
      expect(payload.role).to.equal('user');
      expect(payload.userId).to.exist;
    });

  });
});



