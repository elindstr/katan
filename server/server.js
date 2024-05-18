const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { authMiddleware } = require('./utils/auth');
const PORT = process.env.PORT || 3001;
const app = express();

// Socket.IO connection event
const httpServer = createServer(app);
const io = new Server(httpServer);
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  // Add other socket event listeners here
});


// Create a new instance of an Apollo server with the GraphQL schema
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Serve static assets
  app.use('/images', express.static(path.join(__dirname, '../client/images')));

  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the async function to start the server
startApolloServer();
