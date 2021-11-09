const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { getConnection } = require('./connectionMock')

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

 
  
  describe('Quando não são enviados os parametros', function () {
    let response = {};
    const DBServer = new MongoMemoryServer();

    before(async function () {
      response = await chai.request(server)
        .post('/users')
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

  describe('Quando o email enviado já está cadastrado', function () {
    let response = {};

    before(async function () {
      await connectionMock.db('Cookmaster')
        .collection('users')
        .insertOne({
          name: 'teste',
          email: 'teste@email.com',
          password: 'senhateste',
        });
          

        response = await chai.request(server)
          .post('/users')
          .send({
            name: 'teste',
            email: 'teste@email.com',
            password: 'senhateste',
          });
    });

    it('Espera o codigo de status 409', function () {
      expect(response).to.have.status(409);
    });
    it('retorna um objeto', function () {
      expect(response.body).to.be.a('object');
    });
    
    it('o objeto possui a propriedade "message"', function () {
      expect(response.body).to.have.property('message');
    });
    
    it('a propriedade "message" possui o texto "Email already registered"',
    function () {
      expect(response.body.message)
      .to.be.equal('Email already registered');
    });
  });

  describe('quando é criado com sucesso', function () {
    let response = {};

    before(async function () {
      response = await chai.request(server)
        .post('/users')
        .send({
          name: 'teste',
          email: 'teste2@email.com',
          password: 'senhateste',
        });   
    });


    it('retorna o código de status 201', function () {
        expect(response).to.have.status(201);
    });

    it('retorna um objeto com o usuario criado', function () {
      const { user } = response.body;
      expect(response.body).to.be.a('object');
      expect(user.name).to.equal('teste');
      expect(user.email).to.equal('teste2@email.com');
      expect(user.role).to.equal('user');
      expect(user.password).to.be.undefined;
      expect(user._id).to.exist;
    });

   

    it('espera que o ususario esteja no banco de dados"', async function () {
      const user = await connectionMock.db('Cookmaster')
      .collection('users')
      .findOne({
        email: 'teste2@email.com'
      });
        expect(user.name).to.equal('teste');
        expect(user.email).to.equal('teste2@email.com');
        expect(user.role).to.equal('user');
        expect(user._id).to.exist;
      });
  });

});

/* codigo adaptado do course da trybe (www.trybe.com) bloco 27.3 testando API com teste de integração */