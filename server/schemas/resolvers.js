const { User, Game } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');
const { GraphQLScalarType, Kind } = require('graphql');

const resolvers = {
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON value',
    parseValue(value) {
      return value; // value from the client input variables
    },
    serialize(value) {
      return value; // value sent to the client
    },
    parseLiteral(ast) {
      switch (ast.kind) {
        case Kind.STRING:
        case Kind.BOOLEAN:
        case Kind.INT:
        case Kind.FLOAT:
          return ast.value;
        case Kind.OBJECT:
          return parseObject(ast);
        default:
          return null;
      }
    },
  }),

  Query: {
    users: async () => {
      return await User.find().select('-password');
    },
    user: async (parent, args, context) => {
      if (context.user) {
        return await User.findById(context.user._id).select('-password');
      }
      throw new AuthenticationError('You are not authenticated!');
    },
    games: async () => {
      return await Game.find();
    },
    game: async (parent, { id }) => {
      return await Game.findById(id);
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    updateUser: async (parent, args, context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(context.user._id, args, { new: true }).select('-password');
      }
      throw new AuthenticationError('You are not authenticated!');
    },
    login: async (parent, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) {
        console.log("login error: no user found with that username", username);
        throw new AuthenticationError('No user found with that username.');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        console.log("login error: incorrect password,", username);
        throw new AuthenticationError('Incorrect password.');
      }
      const token = signToken(user);
      console.log("new sign in:", username);

      return { token, user };
    },
    createGame: async (parent, { state }) => {
      const game = new Game({ state });
      await game.save();
      return game;
    },
    updateGame: async (parent, { id, state }) => {
      return await Game.findByIdAndUpdate(id, { state }, { new: true });
    },
  }
};

function parseObject(ast) {
  const value = Object.create(null);
  ast.fields.forEach((field) => {
    value[field.name.value] = parseLiteral(field.value);
  });
  return value;
}

function parseLiteral(ast) {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.BOOLEAN:
      return ast.value === 'true';
    case Kind.OBJECT:
      return parseObject(ast);
    case Kind.LIST:
      return ast.values.map(parseLiteral);
    default:
      return null;
  }
}

module.exports = resolvers;
