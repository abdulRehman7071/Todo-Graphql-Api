// index.js
const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");
require("dotenv").config();

const Todo = require("./models/index");

console.log("Here is your Todo model:");

const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo]
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(title: String!): Todo
    updateTodo(id: ID!, title: String, completed: Boolean): Todo
    deleteTodo(id: ID!): Todo
  }
`;

const resolvers = {
  Query: {
    todos: async () => await Todo.find(),
    todo: async (_, { id }) => await Todo.findById(id),
  },
  Mutation: {
    createTodo: async (_, { title }) => {
      const todo = new Todo({ title });
      await todo.save();
      return todo;
    },
    updateTodo: async (_, { id, title, completed }) => {
      const todo = await Todo.findByIdAndUpdate(
        id,
        { title, completed },
        { new: true }
      );
      return todo;
    },
    deleteTodo: async (_, { id }) => {
      const todo = await Todo.findByIdAndDelete(id);
      return todo;
    },
  },
};

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  await mongoose.connect(process.env.MONGO_URI);

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
