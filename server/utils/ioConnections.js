const { Server } = require('socket.io');
const { Game, Trade } = require('../models');
const socketAuth = require('./socketAuth');
const { gameInitialState, playerGenerator } = require('./gameInitialState');

// todo: (1) implement initial building sequence; (2) turn management

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
        game.state.messages = [...game.state.messages, message];
        await game.markModified('state');
        await game.save();
        await io.to(gameId).emit('stateUpdated', game.state);
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
      type: 'system'
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
    socket.on('handleAction', async (gameId, action, arg1, arg2) => {
      console.log("handling user action:", action, "by", socket.username, "in game", gameId);

      if (action === "Start Game") { 
        
        // Shuffle board
        const game = await shuffle(gameId);

        // Generate players
        const colors = ["red", "blue", "green", "darkviolet"];
        game.state.seatsObject.forEach((user, index) => {
          if (user !== null) {
            const player = playerGenerator();
            player.username = user.username; 
            player.socketId = user.socketId;
            player.seat = index;
            player.color = colors[index];
            game.state.players.push(player);
          }
        });
        game.state = {
          ...game.state,
          isInInitialSetup: true,
          isInGame: false
        }

        // save and update
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        sendSystemMessage(gameId, `new game started`);

        // trigger initial roll
        io.to(gameId).emit('getInitialRoll');

      } else if (action === "Roll Dice") {
        await rollDice(gameId);
        const updatedGame = await collectResources(gameId);
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
        // Select and remove a devCard
        const game = await Game.findById(gameId);
        const devCardSelected = game.state.devCards.pop();
        let devCardSelectedType;
        if (devCardSelected === "Knight") devCardSelectedType = 'knight';
        if (devCardSelected === "Road Building") devCardSelectedType = 'roadBuilding';
        if (devCardSelected === "Year of Plenty") devCardSelectedType = 'yearOfPlenty';
        if (devCardSelected === "Monopoly") devCardSelectedType = 'monopoly';
        if (devCardSelected === "Victory Point") devCardSelectedType = 'victoryPoint';

        // Add to player's inventory
        const player = game.state.players.find(player => player.username === socket.username);
        player.inventory[devCardSelectedType] += 1;

        // Subtract cost
        player.inventory.wheat -= 1
        player.inventory.ore -= 1
        player.inventory.sheep -= 1

        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        await sendSystemMessage(gameId, `${socket.username} bought a development card`);

        // updates points
        await updatePoints(gameId)

      } else if (action === "Play Knight") {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        
        // decrement knight from inventory and increment army
        player.inventory.knight -= 1;
        player.knightCount += 1;

        // update state
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        sendSystemMessage(gameId, `${socket.username} played knight card`);

        // implement triggerRobberSteal
        socket.emit('robberAuth');
      
      } else if (action === "Moved Robber") {
        // arg1 = robberHexTarget; arg2 = robberUsername
        console.log(`${socket.username} moved the robber to hex ID ${arg1} on player ${arg2}`)

        const game = await Game.findById(gameId);
        const stealer = game.state.players.find(player => player.username === socket.username);
        const victim = game.state.players.find(player => player.username === arg2);

        // move robber
        game.state.hexes.forEach(hex => {
          hex.hasRobber = false;
        });
        game.state.hex[arg1].hasRobber = true

        // steal resources
        const victimResources = [];
        for (let resource in victim.inventory) {
          for (let i = 0; i < victim.inventory[resource]; i++) {
            victimResources.push(resource);
          }
        }
        let stolenResource;
        if (victimResources.length > 0) {
          const randomIndex = Math.floor(Math.random() * victimResources.length);
          stolenResource = victimResources[randomIndex];

          stealer.inventory[stolenResource] += 1;
          victim.inventory[stolenResource] -= 1;
        }

        // save and update state
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        await sendSystemMessage(gameId, `${socket.username} moved the robber and stole from ${arg2}`);

        // updates points (and check for largest army)
        await updatePoints(gameId)

      } else if (action === "Play Road Building") {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        const userColor = player.color
        player.inventory.roadBuilding -= 1
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        socket.emit('isBuildingRoadTwice', userColor);  

      } else if (action === "Play Year of Plenty Card") {
        //arg1 = chosenResources object
        console.log('YOP resource:', arg1)

        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        for (const resource in arg1) {
          if (arg1.hasOwnProperty(resource) && arg1[resource] > 0) {
              player.inventory[resource] += arg1[resource];
          }
      }
      player.inventory.yearOfPlenty -= 1

        // save and update state
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        sendSystemMessage(gameId, `${socket.username} played year of plenty card`);

      } else if (action === "Play Monopoly Card") {
        // arg1 = resource to steal (string)
        console.log('monopoly resource:', arg1);
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
    
        let totalStolen = 0;
        game.state.players.forEach(otherPlayer => {
            if (otherPlayer.username !== player.username) {
                const stolenAmount = otherPlayer.inventory[arg1];
                totalStolen += stolenAmount;
                otherPlayer.inventory[arg1] = 0;
            }
        });
        player.inventory[arg1] += totalStolen;
        player.inventory.monopoly -= 1
    
        // Save and update state
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        sendSystemMessage(gameId, `${socket.username} played Monopoly card and stole ${totalStolen} ${arg1}`);


      } else if (action === "End Turn") {
      
      }
    });

    // Implementing builds
    socket.on('handleBuildAction', async (gameId, type, id, isFreeBuild) => {
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
          // Subtract cost
          if (!isFreeBuild) {
            player.inventory.wood -= 1
            player.inventory.brick -= 1
          }

          // update longestRoad
          const longestRoad = await calculateLongestRoad(game.state.roads, player.username)
          player.roadLength = longestRoad
        }
        if (type == "settlement") {
          game.state.settlements[id] = {
            ...game.state.settlements[id],
            color: player.color,
            username: player.username
          }
          // Subtract cost          
          if (!isFreeBuild) {
            player.inventory.wood -= 1
            player.inventory.brick -= 1
            player.inventory.sheep -= 1
            player.inventory.wheat -= 1
          }
        }
        if (type == "city") {
          game.state.settlements[id] = {
            ...game.state.settlements[id],
            color: player.color,
            username: player.username,
            isCity: true
          }
          // Subtract cost
          if (!isFreeBuild) {
            player.inventory.ore -= 3
            player.inventory.wheat -= 2
          }
        }

        // Save state and announce
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        await sendSystemMessage(gameId, `${socket.username} built a ${type}`);

        // updates points
        await updatePoints(gameId)

      } catch (error) {
        console.error('Error during build:', error);
      }
    });

    // Initial Setup (XXX)

    //io.to(gameId).emit('getInitialRoll') <--- triggered above in handling of Start Game button
    
    socket.on('reportInitialRoll', async (gameId, roll) => {
      const game = await Game.findById(gameId);
      const player = game.state.players.find(player => player.username === socket.username);

      // update 
      player.initialState.initialRoll = roll

      // Save state and announce
      game.markModified('state');
      const updatedGame = await game.save();
      io.to(gameId).emit('stateUpdated', updatedGame.state);
      await sendSystemMessage(gameId, `${player.username} rolled ${roll}.`);

      // Check if all players have initialRoll values
      let isWaiting = false
      game.players.forEach((player) => {
        if (!player.initialState.initialRoll) isWaiting = true
      })
      if (isWaiting) {
        return
      }

      // set player.turnOrder
      let highestRoll = 0
      let highestPlayer
      let highestPlayerIndex 
      game.players.forEach((player, index) => {
        if (player.initialState.initialRoll > highestRoll) {
          highestPlayer = player.username
          highestPlayerIndex = index
          highestRoll = player.initialState.initialRoll
        }
      })

      let allAssignedTurns = false
      let currentIndex = highestPlayerIndex
      let turnOrder = 0
      while (allAssignedTurns == false) {
        player[currentIndex].turnOrder = turnOrder
        turnOrder+=1

        if (currentIndex == game.players.length-1) {
          currentIndex = 0
        } 
        else {
          currentIndex+=1
        }
      }

      //save and update; trigger initial placements
      await game.save();
      await sendSystemMessage(gameId, `${highestPlayer} starts by placing their first settlement and road.`);

      //todo: store socket id in player creation
      io.emit.to('[firstPlayerSocketID').on('getInitialSettlement')
    })

    socket.on('reportInitialPlacement', async (gameId, type, locationId) => {
      const game = await Game.findById(gameId);
      const player = game.state.players.find(player => player.username === socket.username);

      // update board

      // todo: program dynamically based on turn and player state

      //let nextType = getInitialSettlement
      let nextType = getInitialRoad
      // let currentPlayerSocketID = ...
      // io.emit.to([currentPlayerSocketID]).on(type)

      //check for all complete; then trigger start of real game play 

    })

    // emit(get initial rolls)
    // track incoming rolls to player.initialState.initialRoll
    // when all incoming rolls received, assign player.turnOrder
    // 
    // emit(get initial settlement and roads) in order based on player.initialState.placedFirstSettlement and player.turnOrder
      // placedFirstSettlement: false,
      // placedFirstRoad: false,
      // placedSecondSettlement: false,
      // placedSecondRoad: false (mutation to require road next to settlement)

    // Trading
    socket.on('makeOffer', async (gameId, offer) => {
      console.log(`${socket.username} made a trade offer.`)
      try {
        const game = await Game.findById(gameId);
        offer.offerer = socket.username
        const newTrade = await Trade.create({ gameId, offer })
        offer.tradeId = newTrade.id

        io.to(gameId).emit('sendOffer', offer);
        await sendSystemMessage(gameId, `${socket.username} made a trade offer.`);
      } catch (error) {
        console.error('Error communicating trade:', error);
      }
    });
    
    socket.on('acceptOffer', async (gameId, offer) => {
      console.log('offer:', offer)
      console.log(`${offer.offerer} made a trade offer.`)
      try {
        const tradeConfirmation = await Trade.updateOne(
          { _id: offer.tradeId }, 
          { $set: { accepted: true } }
        );
        console.log('tradeConfirmation:', tradeConfirmation)
        if (tradeConfirmation.modifiedCount === 0) {
          // error accepting trade; or trade already accepted
          console.log('there was a problem accepting the trade:', tradeConfirmation)
          return null
        }      
        
        // implement trade
        const game = await Game.findById(gameId);
        const offerer = game.state.players.find(player => player.username === offer.offerer);
        const accepter = game.state.players.find(player => player.username === socket.username);

        // Update inventories based on the trade offer
        Object.entries(offer.offererGiving).forEach(([resource, amount]) => {
          offerer.inventory[resource] -= amount;
          accepter.inventory[resource] += amount;
        });

        Object.entries(offer.offererReceiving).forEach(([resource, amount]) => {
          offerer.inventory[resource] += amount;
          accepter.inventory[resource] -= amount;
        });
        
        // update
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        await sendSystemMessage(gameId, `${socket.username} accepted ${offer.offerer}'s offer.`);

      } catch (error) {
        console.error('Error accepting trade:', error);
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
            // game.state.seats = game.state.seats.map((seat) => (seat === socket.username ? null : seat));
            game.state.seatsObject = game.state.seatsObject.map((seat) => (seat.username === socket.username ? { username: null, socketId: null } : seat));
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

  // update points (and check longest road / largest army status)
  const updatePoints = async (gameId) => {
    console.log("updating points");
    const game = await Game.findById(gameId);

    if (!game) {
      console.error("Game not found:", gameId);
      return;
    }

    // update longest road and largest army holders
    let longestRoadPlayer = null;
    let minLongestRoad = 4;
    let largestArmyPlayer = null;
    let minLargestArmy = 2;

    // check if any player already has award
    game.state.players.forEach(player => {
      if (player.longestRoad) {
        longestRoadPlayer = player.username;
        minLongestRoad = player.roadLength;
      }
      if (player.largestArmy) {
        largestArmyPlayer = player.username;
        minLargestArmy = player.knightCount;
      }
    });

    // check for the minimum needed and (re)assign awards if new
    await game.state.players.forEach(player => {
      if (player.roadLength > minLongestRoad) {
        if (longestRoadPlayer) {
          const prevHolder = game.state.players.find(p => p.username === longestRoadPlayer);
          if (prevHolder) prevHolder.longestRoad = false;
        }
        player.longestRoad = true;
        longestRoadPlayer = player.username;
        minLongestRoad = player.roadLength;
        sendSystemMessage(gameId, `${player.username} acquired the longest road!`);
      }

      if (player.knightCount > minLargestArmy) {
        if (largestArmyPlayer) {
          const prevHolder = game.state.players.find(p => p.username === largestArmyPlayer);
          if (prevHolder) prevHolder.largestArmy = false;
        }
        player.largestArmy = true;
        largestArmyPlayer = player.username;
        minLargestArmy = player.knightCount;
        sendSystemMessage(gameId, `${player.username} acquired the largest army!`);
      }
    });

    // Update points for each player
    await game.state.players.forEach(player => {
      player.points = 0;

      // Count settlements
      game.state.settlements.forEach(settlement => {
        if (settlement.username === player.username) {
          if (!settlement.isCity) {
            player.points += 1;
          } else {
            player.points += 2;
          }
        }
      });

      // Count victory points and awards
      player.points += player.inventory.victoryPoint || 0;
      if (player.longestRoad) player.points += 2;
      if (player.largestArmy) player.points += 2;
    });

    // Save and update
    game.markModified('state');
    const updatedGame = await game.save();
    io.to(gameId).emit('stateUpdated', updatedGame.state);
    console.log('Points updated');

    // Check for win
    await updatedGame.state.players.forEach(player => {
      if (player.points >= 10) {
        sendSystemMessage(gameId, `${player.username} won!`);
        io.to(gameId).emit('endGame');
      }
    })
  };

  return io;
}; // END IO SERVER

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
  hexes[desertHexIndex].hasRobber = true

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

  game.markModified('state');
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

// Collect Resources For Current Roll
async function collectResources(gameId) {
  console.log("collecting resources");
  const game = await Game.findById(gameId);
  const diceTotal = game.state.dice[0].value + game.state.dice[1].value;
  game.state.hexes.forEach(hex => {
    if (hex.value === diceTotal && !hex.hasRobber) {
      hex.adjacentNodes.forEach(nodeId => {
        const settlement = game.state.settlements[nodeId];

        if (settlement && settlement.username) {
          const player = game.state.players.find(player => player.username === settlement.username);

          if (player) {
            const resourceType = hex.resource;
            if (settlement.isCity) {
              player.inventory[resourceType] = (player.inventory[resourceType] || 0) + 2;
            } else {
              player.inventory[resourceType] = (player.inventory[resourceType] || 0) + 1;
            }
            console.log(`Player ${player.username} received ${settlement.isCity ? 2 : 1} ${resourceType}`);
          }
        }
      });
    }
  });
  game.markModified('state.players');
  const updatedGame = await game.save();
  return updatedGame;
}


// Calculate Longest Road (Path of Roads)
function calculateLongestRoad(roads, username) {
  const userRoads = roads.filter(road => road.username === username);
  let paths = [];

  // Review userRoads; locate userRoads that are dead ends; and push each dead end into 'paths' as the beginning road of a potential longest path segment.
  userRoads.forEach(road => {
    const leftDeadEnd = !userRoads.some(r => road.adjacentRoadsLeft.includes(r.id));
    const rightDeadEnd = !userRoads.some(r => road.adjacentRoadsRight.includes(r.id));
    if (leftDeadEnd) {
      paths.push([{ 
        roadId: road.id, 
        possibleAdjacents: road.adjacentRoadsRight
      }]);
    }
    if (rightDeadEnd) {
      paths.push([{ 
        roadId: road.id, 
        possibleAdjacents: road.adjacentRoadsLeft
      }]);
    }
  });

  // Now for each path, look at the last element in the path, and check if any of possibleAdjacents includes any of the userRoads not already in the current path. If there are more than one matches, branch into a new path.
  let longestRoad = 0;
  paths.forEach(path => {
    let stack = [path];
    while (stack.length > 0) {
      const currentPath = stack.pop();
      const lastElement = currentPath[currentPath.length - 1];
      const lastElementId = lastElement.roadId;
      const possibleAdjacents = lastElement.possibleAdjacents;

      let extended = false;
      possibleAdjacents.forEach(adjId => {
        if (!currentPath.some(p => p.roadId === adjId)) {
          const adjacentRoad = userRoads.find(r => r.id === adjId);
          if (adjacentRoad) {

            // Determine next possibleAdjacents by finding id of current road in the next road's adjacencies and looking only in the other direction
            let nextPossibleAdjacents;
            if (adjacentRoad.adjacentRoadsRight.includes(lastElementId)) {
              nextPossibleAdjacents = adjacentRoad.adjacentRoadsLeft;
            } else if (adjacentRoad.adjacentRoadsLeft.includes(lastElementId)) {
              nextPossibleAdjacents = adjacentRoad.adjacentRoadsRight;
            } else {
              console.log('error; found broken road chain with', lastElementId, 'and',  adjacentRoad.roadId);
              // could be error in gameInitialRoads.js data 
            }
            const newPath = [...currentPath, 
              { roadId: adjId, 
                possibleAdjacents: nextPossibleAdjacents, 
              }];
            stack.push(newPath);
            extended = true;
          }
        }
      });
      if (!extended) {
        longestRoad = Math.max(longestRoad, currentPath.length);
      }
    }
  });
  return longestRoad;
}

module.exports = initializeSocket;
