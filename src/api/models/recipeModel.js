const { ObjectId } = require('mongodb');

const mongoConnection = require('./connections');

const creatRecipe = async ({ name, ingredients, preparation }, userId) => {
  const recipeCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('recipes'));

    const { insertedId } = await recipeCollection
    .insertOne({ name, ingredients, preparation, userId: ObjectId(userId) });

    return {
      recipe: {
        name,
        ingredients,
        preparation,
        userId: ObjectId(userId),
        _id: insertedId,
      },
    };
};

const readAllRecipes = async () => {
  const recipeCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('recipes'));

    return recipeCollection
    .find()
    .toArray();
};

const readRecipeById = async (id) => {
  const recipeCollection = await mongoConnection.getConnection()
    .then((db) => db.collection('recipes'));

    return recipeCollection
    .findOne({ _id: ObjectId(id) });
};

module.exports = {
  creatRecipe,
  readAllRecipes,
  readRecipeById,
};