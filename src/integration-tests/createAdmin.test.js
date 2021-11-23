const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { getConnection } = require('./connectionMock')

const server = require('../api/app');

chai.use(chaiHttp);

const { expect } = chai;

describe('POST /users/admin', function () {
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
      .collection('users')
      .deleteMany({});
    MongoClient.connect.restore();
  });

  describe('quando não é enviado um token', () => {
    let response = {};
    

    before(async function () {
      response = await chai.request(server)
        .post('/users/admin');
    });

    it('Espera o codigo de status 401', function () {
      console.log(response.body);
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
        .post('/users/admin')
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

    before(async function () {
      response = await chai.request(server)
        .post('/users/admin')
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

  describe('quando o usuario não é um admin', () => {
    let response = {};

    before(async function () {
      

      response = await chai.request(server)
        .post('/users/admin')
        .set({
          authorization: token,
        })
        .send({
          email: 'admin@email.com',
          password: 'senhaadmin',
          name: 'teste'
        });
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
    
    it('a propriedade "message" possui o texto "Only admins can register new admins"',
    function () {
      expect(response.body.message)
      .to.be.equal('Only admins can register new admins');
    });
  });

  describe('quando o novo admin é criado com sucesso', () => {
    let response = {};
    let adminToken;

    before(async function () {
      await connectionMock.db('Cookmaster')
      .collection('users')
      .insertOne({
        _id: '15f46914677df66035f61a356',
        name: 'admin',
        email: 'admin@email.com',
        password: 'senhaadmin',
        role:'admin',
      });

    adminToken = await chai.request(server)
      .post('/login')
      .send({
        email: 'admin@email.com',
        password: 'senhaadmin',
      })
      .then((response) => response.body.token);


      response = await chai.request(server)
        .post('/users/admin')
        .set({
          authorization: adminToken,
        })
        .send({
          email: 'testeadmin@email.com',
          password: 'testesenhaadmin',
          name: 'testeadmin'
        });
    });

    it('retorna um objeto com o usuario criado', function () {
      const { user } = response.body;
      expect(response.body).to.be.a('object');
      expect(user.name).to.equal('testeadmin');
      expect(user.email).to.equal('testeadmin@email.com');
      expect(user.role).to.equal('admin');
      expect(user.password).to.be.undefined;
      expect(user._id).to.exist;
    });
  });
});