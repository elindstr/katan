const { Server } = require('socket.io');
const { Game } = require('../models');
const socketAuth = require('./socketAuth');
const { gameInitialState, playerGenerator } = require('./gameInitialState');

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  io.use(socketAuth);

  // Chat message helper functions
  const handleSendMessage = async (gameId, message) => {
    console.log("@ handleSendMessage:", gameId, message)
    try {
      const game = await Game.findById(gameId);
      if (game) {
        game.state.messages.push(message);
        game.markModified('state.messages');
        await game.save();
        io.to(gameId).emit('stateUpdated', game.state);
      } else {
        console.log('Message sending failed; game id not found:', gameId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendSystemMessage = async (gameId, messageBody) => {
    const message = {
      author: 'system',
      body: messageBody,
      timestamp: Date.now(),
      //TODO: add type: system displayed in unique style
    };
    await handleSendMessage(gameId, message);
  };

  // IO Connections
  io.on('connection', (socket) => {
    // User Connects
    console.log(`User ${socket.username} connected`);

    // Create Game
    socket.on('createGame', async (callback) => {
      console.log("createGame")

      try {
        const game = new Game();
        game.state = {
          ...gameInitialState,
          host: socket.username,
          seats: Array(4).fill(null),
          createdOn: Date.now(),
          messages: [
            { author: 'system', body: 'creating new game', timestamp: Date.now() },
          ],
        };
        await game.save();
        const gameId = game._id.toString();

        // Join user to room
        socket.join(gameId);

        // Update room list
        const sockets = await io.in(gameId).fetchSockets();
        const roomUserList = sockets.map(s => s.username || 'anon');
        io.in(gameId).emit('users', roomUserList);

        callback(gameId);
      } catch (error) {
        console.log('Error creating game:', error);
        callback(null);
      }
    });

    // Join Game
    socket.on('joinGame', async (gameId) => {
      socket.join(gameId);
      await sendSystemMessage(gameId, `${socket.username} joined the room`);

      // Update room list
      const sockets = await io.in(gameId).fetchSockets();
      const roomUserList = sockets.map(s => s.username || 'anon');
      io.in(gameId).emit('users', roomUserList);
    });

    // User Requests List of Games Available To Join
    socket.on('requestGames', async () => {
      try {
        const games = await Game.find({ 'state.isAlive': true }).sort({ 'state.createdOn': 1 });
        socket.emit('games', games);
      } catch (error) {
        console.error('Error requesting games:', error);
      }
    });

    // User Actions
    socket.on('handleAction', async (gameId, action) => {
      console.log("handling user action:", action, "by", socket.username, "in game", gameId);

      if (action === "Start Game") {
        
        // Shuffle board
        const game = await shuffle(gameId);

        // Generate players
        const colors = ["red", "blue", "green", "darkviolet"];
        game.state.seats.forEach((user, index) => {
          if (user !== null) {
            const player = playerGenerator();
            player.username = socket.username;
            player.seat = index;
            player.color = colors[index];
            game.state.players.push(player);
          }
        });

        // Begin gameplay loop (TODO)
        game.state = {
          ...game.state,
          isInInitialSetup: true,
          isInGame: false
        }

        // Save and update
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
      
      } else if (action === "Shuffle") {
        const updatedGame = await shuffle(gameId);
        io.to(gameId).emit('stateUpdated', updatedGame.state);

      } else if (action === "Roll Dice") {
        const updatedGame = await rollDice(gameId);
        io.to(gameId).emit('stateUpdated', updatedGame.state);

      // Granting build authorizations
      } else if (action === "Build Road") {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        const userColor = player.color
        socket.emit('isBuildingRoad', userColor);  

      } else if (action === "Build Settlement") {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        const userColor = player.color
        socket.emit('isBuildingSettlement', userColor);

      } else if (action === "Build City") {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        const userColor = player.color
        socket.emit('isBuildingCity', userColor);
        
      } else if (action === "Buy Development Card") {
        
      } else if (action === "Play Development Card") {
        
      } else if (action === "Trade") {
        
      } else if (action === "End Turn") {
      
      }
    });

    // Implementing builds
    socket.on('handleBuildAction', async (gameId, type, id) => {
      console.log("handling user build action:", type, '@ index', id, "by", socket.username, "in game", gameId);

      try {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        
        // update board
        if (type == "road") {
          game.state.roads[id] = {
            ...game.state.roads[id],
            color: player.color,
            username: player.username
          }
          console.log(player.color, player.username)
          console.log(game.state.roads[id])
        }
        if (type == "settlement") {
          game.state.settlements[id] = {
            ...game.state.settlements[id],
            color: player.color,
            username: player.username
          }
          console.log(player.color, player.username)
          console.log(game.state.settlements[id])
        }
        if (type == "city") {
          game.state.settlements[id] = {
            ...game.state.settlements[id],
            color: player.color,
            username: player.username,
            isCity: true
          }
        }
        
        // update player inventory  (TODO)
        // update player points     (TODO)
        // check for longest road   (TODO)

        // Save state and announce
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        sendSystemMessage(gameId, `${socket.username} built a ${type}`);

      } catch (error) {
        console.error('Error during build:', error);
      }
    });

    // User Posts Update(s) to Game State
    socket.on('updateGameState', async (gameId, updates) => {
      try {
        const game = await Game.findById(gameId);
        if (game) {
          game.state = { ...game.state, ...updates };
          await game.save();
          io.to(gameId).emit('stateUpdated', game.state);

          console.log('Game state update published', updates);
        } else {
          console.log('Game state update failed; game id not found:', gameId);
        }
      } catch (error) {
        console.error('Error updating game state:', error);
      }
    });

    // Room Chat Messages
    socket.on('sendMessage', async (gameId, message) => {
      await handleSendMessage(gameId, message);
    });

    // User Disconnects
    socket.on('disconnect', async () => {
      try {
        console.log(`User ${socket.username} disconnected`);

        // Get list of rooms to which the socket is joined
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        for (const roomId of rooms) {
          const game = await Game.findById(roomId);

          if (game) {
            // Stand up
            game.state.seats = game.state.seats.map((seat) => (seat === socket.username ? null : seat));
            await game.save();

            // Announce leaving
            await sendSystemMessage(roomId, `${socket.username} left the room`);

            // Leave room
            socket.leave(roomId);
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  return io;
};

// Helper functions
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Shuffle for new game
async function shuffle(gameId) {
  const game = await Game.findById(gameId);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Shuffle hex numbers and resources
  const hexValues = shuffleArray(game.state.hexes.map(hex => hex.value));
  const hexResources = shuffleArray(game.state.hexes.map(hex => hex.resource));

  const hexes = game.state.hexes.map((hex, index) => ({
    ...hex,
    value: hexValues[index],
    resource: hexResources[index]
  }));

  // Ensure that desert value = ''
  const desertHexIndex = hexes.findIndex(hex => hex.resource === 'desert');
  const emptyValueHexIndex = hexes.findIndex(hex => hex.value === '');
  [hexes[desertHexIndex].value, hexes[emptyValueHexIndex].value] = [hexes[emptyValueHexIndex].value, hexes[desertHexIndex].value];

  // Shuffle development cards
  const devCards = shuffleArray([...game.state.devCards]);

  // Shuffle port values
  const portValues = shuffleArray(game.state.ports.filter(port => port.canHaveValue).map(port => port.value));
  const ports = game.state.ports.map(port => 
    port.canHaveValue ? { ...port, value: portValues.pop() } : port
  );

  game.state = {
    ...game.state,
    hexes,
    devCards,
    ports
  };

  const updatedGame = await game.save();
  return updatedGame;
}

// Roll dice
async function rollDice(gameId) {
  console.log("running roll dice")
  const game = await Game.findById(gameId);

  const getRandomDie = () => Math.floor(Math.random() * 6) + 1;
  const die1 = getRandomDie();
  const die2 = getRandomDie();

  game.state = {
    ...game.state,
    dice: [
      { value: die1, src: `/images/dice/${die1}.png`, alt: `Die: ${die1}` },
      { value: die2, src: `/images/dice/${die2}.png`, alt: `Die: ${die2}` }
    ]
  }

  const updatedGame = await game.save();
  return updatedGame;
}

module.exports = initializeSocket;
