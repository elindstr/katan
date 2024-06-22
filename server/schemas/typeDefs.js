//server/schemas/typeDefs.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar JSON

  type User {
    _id: ID
    firstName: String
    lastName: String
    username: String
  }

  type Auth {
    token: ID
    user: User
  }

  type Game {
    _id: ID
    state: JSON
    createdAt: String
  }

  type Query {
    users: [User]
    user: User
    games: [Game]
    game(id: ID!): Game
  }

  type Mutation {
    addUser(firstName: String!, lastName: String!, username: String!, password: String!): Auth
    updateUser(firstName: String, lastName: String, username: String, password: String): User
    login(username: String!, password: String!): Auth
    createGame(state: JSON): Game
    updateGame(id: ID!, state: JSON): Game
    updateUsername(username: String!): User
  }
`;

module.exports = typeDefs;
