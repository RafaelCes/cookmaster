const mongoConnection = require('./connections');

const checkEmail = async ({ email }) => {
  const userCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('users'));

    const user = await userCollection
    .findOne({ email });

    return user;
};

const createUser = async ({ name, email, password }) => {
  const userCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('users'));

    const { insertedId } = userCollection
    .insertOne({ name, email, password, role: 'user' });

    return { user: {
        name,
        email,
        role: 'user',
        _id: insertedId,
      },
    };
};

module.exports = {
  checkEmail,
  createUser,
};