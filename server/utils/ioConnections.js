const { Server } = require('socket.io');
const { Game } = require('../models');
const socketAuth = require('./socketAuth');
const gameInitialState = require('./gameInitialState');

let users = [];

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`User ${socket.username} connected`);
    users.push({ id: socket.userId, username: socket.username });
    io.emit('users', users);

    socket.on('createGame', async (callback) => {
      try {
        const game = new Game();
        game.state = {
          ...gameInitialState,
          host: socket.username,
          seats: Array(4).fill(null),
          messages: [{ author: 'system', body: 'creating new game', timestamp: Date.now() }]
        };
        await game.save();
        socket.join(game._id.toString());
        io.emit('games', await Game.find());

        if (callback) {
          callback(game._id.toString());
        }

        // Send initial game state to the creator
        socket.emit('stateUpdated', game.state);
      } catch (error) {
        console.error('Error creating game:', error);
      }
    });

    socket.on('joinGame', (gameId) => {
      socket.join(gameId);
      console.log(`User ${socket.username} joined game room ${gameId}`);
    });

    socket.on('updateGameState', async (gameId, updates) => {
      try {
        const game = await Game.findById(gameId);
        if (game) {
          game.state = { ...game.state, ...updates };
          await game.save();
          io.to(gameId).emit('stateUpdated', game.state);
        } else {
          console.log('Game not found for update:', gameId);
        }
      } catch (error) {
        console.error('Error updating game state:', error);
      }
    });

    socket.on('sendMessage', async (gameId, message) => {
      try {
        const game = await Game.findById(gameId);
        if (game) {
          game.state.messages.push(message);
          await game.save();
          io.to(gameId).emit('stateUpdated', game.state);
        } else {
          console.log('Game not found for message:', gameId);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('requestGames', async () => {
      try {
        const games = await Game.find();
        socket.emit('games', games);
      } catch (error) {
        console.error('Error requesting games:', error);
      }
    });

    socket.on('disconnect', async () => {
      try {
        console.log(`User ${socket.username} disconnected`);
        users = users.filter((user) => user.id !== socket.userId);
        const games = await Game.find();
        games.forEach(async (game) => {
          if (game.state && game.state.seats) {
            game.state.seats = game.state.seats.map((seat) => (seat === socket.username ? null : seat));
            await game.save();
          }
        });
        io.emit('users', users);
        io.emit('games', await Game.find());
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
