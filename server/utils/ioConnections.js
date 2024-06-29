const { Server } = require('socket.io');
const { Game, Trade } = require('../models');
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
    // console.log("@ handleSendMessage:", gameId, message)
    try {
      const game = await Game.findById(gameId);
      if (game) {
        game.state.messages = [...game.state.messages, message];
        await game.markModified('state.messages');
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
        console.log(`created new game: ${gameId}`)

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
      try {
        const game = await Game.findById(gameId);
        if (!game) {
          socket.emit('error', 'Game not found');
          return;
        }

        socket.join(gameId);
        await sendSystemMessage(gameId, `${socket.username} joined the room`);

        const sockets = await io.in(gameId).fetchSockets();
        const roomUserList = sockets.map(s => s.username || 'anon');
        io.in(gameId).emit('users', roomUserList);
        //update game s

      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', 'Error joining game');
      }
    });

    // User Requests List of Games Available To Join
    socket.on('requestGames', async () => {
      try {
        const games = await Game.find({ 'state.isAlive': true }).sort({ 'state.createdOn': -1 });
    
        const gamesWithPlayerCount = await Promise.all(games.map(async (game) => {
          const room = io.sockets.adapter.rooms.get(game._id.toString());
          const socketCount = room ? room.size : 0;
          return {
            ...game.toObject(),
            socketCount,
          };
        }));
    
        socket.emit('games', gamesWithPlayerCount);
      } catch (error) {
        console.error('Error requesting games:', error);
      }
    });

    // User Actions
    socket.on('handleAction', async (gameId, action, arg1, arg2) => {
      console.log("handling user action:", action, "by", socket.username, "in game", gameId);

      if (action === "Start Game") { 
        
        // Shuffle board
        const game = await shuffleBoard(gameId);

        // Generate players
        const colors = ["red", "blue", "green", "darkviolet"];
        if (!game.state.seatsObject || game.state.seatsObject.every(seat => seat.username === null)) {
          console.log(`error starting ${gameId}; no one seated`);
          return;
        }

        // filter for non empty seats; assign seat holders as players
        const nonEmptySeats = game.state.seatsObject.filter(seat => seat.username !== null);
        nonEmptySeats.forEach((user, index) => {
          if (user.username !== null) {
            const player = playerGenerator();
            player.username = user.username; 
            player.socketId = user.socketId;
            player.seat = index;
            player.color = colors[index];
            game.state.players.push(player);

            // Update the existing seatsObject
            game.state.seatsObject[index] = {
            username: player.username,
            socketId: player.socketId,
            color: player.color // dev
            };
          }
        
        // clear unused seatsObject data
        for (let i = nonEmptySeats.length; i < game.state.seatsObject.length; i++) {
          game.state.seatsObject[i] = { username: null, socketId: null };
        }

        });
        game.state = {
          ...game.state,
          isInInitialSetup: true,
          isInGame: false,
          numSeats: game.state.players.length
        }

        // save and update
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        await sendSystemMessage(gameId, `new game started`);

        // trigger initial roll
        io.to(gameId).emit('getInitialRoll');

      } else if (action === "Roll Dice") {
        const game = await Game.findById(gameId);
        game.state.dice = await rollDice();
        const diceTotal = game.state.dice[0].value + game.state.dice[1].value;
        game.state.haveRolled = true;
        
        // Collect resources if the dice total is not 7
        if (diceTotal !== 7) {
          game.state.hexes.forEach(hex => {
            if (hex.value === diceTotal && !hex.hasRobber) {
              hex.adjacentNodes.forEach(nodeId => {
                const settlement = game.state.settlements[nodeId];
                
                if (settlement && settlement.username) {
                  const player = game.state.players.find(player => player.username === settlement.username);
                  
                  if (player) {
                    const resourceType = hex.resource;
                    const resourceAmount = settlement.isCity ? 2 : 1;
                    player.inventory[resourceType] = (player.inventory[resourceType] || 0) + resourceAmount;
      
                    // console.log(`Player ${player.username} received ${resourceAmount} ${resourceType}`);
                  }
                }
              });
            }
          });
        }
      
        // Save the updated game state
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
      
        // Check if the dice total is 7
        if (diceTotal === 7) {
          game.state.isHandlingSeven = true;
      
          // Trigger discard half for players with more than 7 resources
          game.state.players.forEach(player => {
            const resourceCount = player.inventory.wheat + player.inventory.brick + player.inventory.wood + player.inventory.sheep + player.inventory.ore;
            if (resourceCount > 7) {
              const discardAmount = Math.floor(resourceCount / 2);
              player.isHandlingSeven = true;
              io.to(player.socketId).emit('sevenRolled', discardAmount);
            }
          });
      
          // Save and update the game state
          game.markModified('state');
          await game.save();
          await sendSystemMessage(gameId, `${socket.username} rolled a seven!`);
      
          // Wait for users to discard, then trigger the user to move the knight
          routingForSevenRoll(gameId);
        }      

      } else if (action === "Initial Roll") {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        game.state.dice = await rollDice();
        const roll = game.state.dice[0].value + game.state.dice[1].value 
        player.initialState.initialRoll = roll

        await game.markModified('state');
        await game.save();
        await sendSystemMessage(gameId, `${socket.username} rolled ${roll}`);

        await checkInitialRolls(gameId)

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

        // Add to player's inventory queue
        const player = game.state.players.find(player => player.username === socket.username);

        if (devCardSelectedType !== 'victoryPoint') {
          player.inventory.inventoryQueue[devCardSelectedType] += 1;
        } else {
          player.inventory[devCardSelectedType] += 1;
        }

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

        // inform player of selection
        io.to(player.socketId).emit('devCardSelected', devCardSelected);

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
        await sendSystemMessage(gameId, `${socket.username} played knight card`);

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
        game.state.hexes[arg1].hasRobber = true

        // steal resources
        const victimResources = [];
        for (let resource in victim.inventory) {
          if (  (resource === 'wood') ||
                (resource === 'brick') ||
                (resource === 'sheep') ||
                (resource === 'wheat') ||
                (resource === 'ore')
            ) {
            for (let i = 0; i < victim.inventory[resource]; i++) {
              victimResources.push(resource);
            }
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

        let systemMsg
        if (stolenResource === 'ore') {
          systemMsg = `${socket.username} moved the robber and stole an ${stolenResource} from ${arg2}`
        } else {
          systemMsg = `${socket.username} moved the robber and stole a ${stolenResource} from ${arg2}`
        }
        await sendSystemMessage(gameId, systemMsg);

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
        // console.log('YOP resource:', arg1)

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
        await sendSystemMessage(gameId, `${socket.username} played year of plenty card`);

      } else if (action === "Play Monopoly Card") {
        // arg1 = resource to steal (string)
        // console.log('monopoly resource:', arg1);
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
        await sendSystemMessage(gameId, `${socket.username} played Monopoly card and stole ${totalStolen} ${arg1}`);


      } else if (action === "End Turn") {
        try {
          const game = await Game.findById(gameId);
          const player = game.state.players.find(player => player.username === socket.username);

          // move inventory queue to inventory
          if (player.inventory.inventoryQueue) {
            Object.keys(player.inventory.inventoryQueue).forEach(resource => {
              if (!player.inventory[resource]) {
                player.inventory[resource] = 0;
              }
              player.inventory[resource] += player.inventory.inventoryQueue[resource];
            });
            player.inventory.inventoryQueue = {
              'knight': 0,
              'roadBuilding': 0,
              'yearOfPlenty': 0,
              'monopoly': 0,
              'victoryPoint': 0,
            }
          }

          // get next next turn
          game.state.currentTurn = (game.state.currentTurn + 1) % game.state.players.length;
          
          // Reset dice roll state
          game.state.haveRolled = false;
      
          // save and update
          game.markModified('state');
          const updatedGame = await game.save();
          io.to(gameId).emit('stateUpdated', updatedGame.state);
        } catch (error) {
          console.error(`Error in handling End Turn action: ${error}`);
        }
      }
    })

    // resolving seven roll
    socket.on('reportingDiscard', async (gameId, giving) => {
      // console.log(`${socket.username} discarded half: ${giving}. GameId: ${gameId}`);

      try {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);

        // update inventory
        Object.entries(giving).forEach(([resource, amount]) => {
          player.inventory[resource] -= amount;
        });
        player.isHandlingSeven = false;

        // save and update
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);

        const givingAsString = Object.entries(giving)
          .map(([resource, amount]) => `${resource}: ${amount}`)
          .join(', ');
        await sendSystemMessage(gameId, `${socket.username} discarded half: ${givingAsString}`);

        // Check if all discards are resolved
        await routingForSevenRoll(gameId);

      } catch (error) {
        console.error('Error during reportingDiscard:', error);
      }
    });

    // function to handle routing after all discards are resolved
    async function routingForSevenRoll(gameId) {
      try {
        const game = await Game.findById(gameId);

        // check if all players have resolved their discards
        let allDiscardsResolved = true;
        game.state.players.forEach(player => {
          if (player.isHandlingSeven === true) {
            allDiscardsResolved = false;
          }
        });
        if (!allDiscardsResolved) return;

        // trigger knight stealing for the current player
        const currentPlayerIndex = game.state.currentTurn;
        const currentPlayer = game.state.players[currentPlayerIndex];
        io.to(currentPlayer.socketId).emit('robberAuth');

      } catch (error) {
        console.error('Error during routingForSevenRoll:', error);
      }
    }

    // Implementing builds
    socket.on('handleBuildAction', async (gameId, type, id, isFreeBuild) => {
      console.log("handling user build action:", type, '@ index', id, "by", socket.username, "in game", gameId);
      let buildMessage

      try {
        const game = await Game.findById(gameId);
        const player = game.state.players.find(player => player.username === socket.username);
        
        // update board
        if (type === "road") {
          buildMessage = `${socket.username} built a ${type}`

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
          player.inventory.roads -= 1

          // update longestRoad
          const longestRoad = await calculateLongestRoad(game.state.roads, player.username)
          player.roadLength = longestRoad
        }
        if (type === "isInitialRoad") {
          buildMessage = `${socket.username} built an initial road`

          // console.log(gameId, `${socket.username} built a ${type}`);
          game.state.roads[id] = {
            ...game.state.roads[id],
            color: player.color,
            username: player.username
          }
          player.inventory.roads -= 1

          // update longestRoad
          const longestRoad = await calculateLongestRoad(game.state.roads, player.username)
          player.roadLength = longestRoad
        }

        if (type === "settlement") {
          buildMessage = `${socket.username} built a ${type}`

          game.state.settlements[id] = {
            ...game.state.settlements[id],
            color: player.color,
            username: player.username
          }

          // check port status
          game.state.ports.forEach(port => {
            if (port.adjacentNodes.includes(id)) {
              if (port.value === '3:1') player.ports.hasWild = true
              if (port.value === '2:1B') player.ports.hasBrick = true
              if (port.value === '2:1Wd') player.ports.hasWood = true
              if (port.value === '2:1Wt') player.ports.hasWheat = true
              if (port.value === '2:1S') player.ports.hasSheep = true
              if (port.value === '2:1O') player.ports.hasOre = true
            }
          })

          // Subtract cost          
          if (!isFreeBuild) {
            player.inventory.wood -= 1
            player.inventory.brick -= 1
            player.inventory.sheep -= 1
            player.inventory.wheat -= 1
          }
          player.inventory.settlements -= 1
          
        }
        if (type === "isInitialSettlement") {
          buildMessage = `${socket.username} built an initial settlement`
          // console.log(gameId, `${socket.username} built a ${type}`);

          // track second settlement status and reward resources
          const settlementCount = game.state.settlements.filter(settlement => settlement.username === player.username).length;

          if (settlementCount === 1) {
            const adjacentHexes = game.state.hexes.filter(hex => hex.adjacentNodes.includes(id))
            adjacentHexes.forEach(hex => {
              const resourceType = hex.resource
              player.inventory[resourceType] += 1
            })
          }
          player.inventory.settlements -= 1

          // check port status
          game.state.ports.forEach(port => {
            if (port.adjacentNodes.includes(id)) {
              if (port.value === '3:1') player.ports.hasWild = true
              if (port.value === '2:1B') player.ports.hasBrick = true
              if (port.value === '2:1Wd') player.ports.hasWood = true
              if (port.value === '2:1Wt') player.ports.hasWheat = true
              if (port.value === '2:1S') player.ports.hasSheep = true
              if (port.value === '2:1O') player.ports.hasOre = true
            }
          })

          game.state.settlements[id] = {
            ...game.state.settlements[id],
            color: player.color,
            username: player.username
          }

        }
        if (type === "city") {
          buildMessage = `${socket.username} built a ${type}`
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
          player.inventory.settlements += 1
          player.inventory.cities -= 1
        }

        // Save state and announce
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);
        await sendSystemMessage(gameId, buildMessage);

        // updates points
        await updatePoints(gameId)

        // handle initial placement routing
        if ( (type === 'isInitialRoad') || (type === 'isInitialSettlement')) {
          routingInitialPlacements(gameId)
        }

      } catch (error) {
        console.error('Error during build:', error);
      }
    });

    // Initial Setup
    // triggered above: io.to(gameId).emit('getInitialRoll') 
    // initials rolls are reported through handleActions; which calls checkInitialRolls to check readiness
    // then routingInitialPlacements() uses state to emit placement order
    async function checkInitialRolls(gameId) {
      try {
        // Fetch the game from the database
        const game = await Game.findById(gameId);
        // console.log(game.state.players);
    
        let highestRoll = 0;
        let highestPlayerIndex = 0;
        let allPlayersRolled = true;
    
        // Check if all players have initialRoll values and find the highest roll
        game.state.players.forEach((player, index) => {
          if (!player.initialState.initialRoll) {
            allPlayersRolled = false;
            console.log(`Waiting for ${player.username}`);
          }
          if (player.initialState.initialRoll > highestRoll) {
            highestPlayerIndex = index;
            highestRoll = player.initialState.initialRoll;
          }
        });
    
        // If not all players have rolled, exit the function
        if (!allPlayersRolled) {
          return; 
        }
    
        // Assign turn orders starting from the highest rolling player
        let turnOrder = 0;
        let currentIndex = highestPlayerIndex;
    
        do {
          // console.log(currentIndex);
          game.state.players[currentIndex].turnOrder = turnOrder;
          turnOrder++;
          currentIndex = (currentIndex + 1) % game.state.players.length;
        } while (currentIndex !== highestPlayerIndex);
    
        const highestPlayer = game.state.players[highestPlayerIndex].username;
        
        // Reorder players based on turnOrder
        game.state.players.sort((a, b) => a.turnOrder - b.turnOrder);
    
        // Save and update the game state
        game.markModified('state');
        await game.save();
        await sendSystemMessage(gameId, `${highestPlayer} starts by placing their first settlement and road.`);
    
        // Trigger initial settlements
        routingInitialPlacements(gameId);
      } catch (error) {
        console.error(`Error in checkInitialRolls: ${error}`);
      }
    }
    
    const routingInitialPlacements = async(gameId) => {
      const game = await Game.findById(gameId);
      
      function countPlayerSettlements(player) {
        return game.state.settlements.filter(hex => hex.username === player.username).length;
      }
      function countPlayerRoads(player) {
        return game.state.roads.filter(road => road.username === player.username).length;
      }

      for (let p = 0; p < game.state.players.length; p++) {
        const player = game.state.players[p] 
        if (countPlayerSettlements(player) == 0) {
          io.to(player.socketId).emit('placeFirstSettlement');
          // console.log(countPlayerSettlements(player))
          return
        }
        if (countPlayerRoads(player) == 0) {
          io.to(player.socketId).emit('placeFirstRoad');
          return
        }
      }
      for (let p = game.state.players.length-1; p >= 0; p--) {
        const player = game.state.players[p] 
        if (countPlayerSettlements(player) == 1) {
          io.to(player.socketId).emit('placeSecondSettlement');
          return
        }
        if (countPlayerRoads(player) == 1) {
          io.to(player.socketId).emit('placeSecondRoad');
          return
        }
      }

      // setup for gameplay
      game.state.isInInitialSetup = false
      game.state.isInGame = true
      game.state.currentTurn = 0
      game.state.haveRolled = false;

      game.markModified('state');
      const updatedGame = await game.save();
      io.to(gameId).emit('stateUpdated', updatedGame.state);
      await sendSystemMessage(gameId, `Game on!`);
    }

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

        const givingString = convertOfferToString(offer.offererGiving);
        const receivingString = convertOfferToString(offer.offererReceiving);
        await sendSystemMessage(gameId, `${socket.username} accepted ${offer.offerer}'s offer: ${givingString} for ${receivingString}`);

      } catch (error) {
        console.error('Error accepting trade:', error);
      }
    });

    socket.on('bankTrade', async (gameId, offer) => {
      console.log('offer:', offer)
      console.log(`${socket.username} made a bank trade offer.`)
      try {

        // implement trade
        const game = await Game.findById(gameId);
        const offerer = game.state.players.find(player => player.username === socket.username);

        // Update inventories based on the trade offer
        Object.entries(offer.offererGiving).forEach(([resource, amount]) => {
          offerer.inventory[resource] -= amount;
        });
        Object.entries(offer.offererReceiving).forEach(([resource, amount]) => {
          offerer.inventory[resource] += amount;
        });
        
        // update
        game.markModified('state');
        const updatedGame = await game.save();
        io.to(gameId).emit('stateUpdated', updatedGame.state);

        const givingString = convertOfferToString(offer.offererGiving);
        const receivingString = convertOfferToString(offer.offererReceiving);
        await sendSystemMessage(gameId, `${socket.username} traded with the bank: ${givingString} for ${receivingString}`);

      } catch (error) {
        console.error('Error accepting trade:', error);
      }
    });
    const convertOfferToString = (offer) => {
      return '{ ' + Object.entries(offer)
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') + ' }';
    };

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
      handleSendMessage(gameId, message);
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
            game.state.seatsObject = game.state.seatsObject.map(seat => 
              seat.username === socket.username ? { username: null, socketId: null } : seat
            );
            await game.save();
    
            // Announce leaving
            await sendSystemMessage(roomId, `${socket.username} left the room`); //(doesn't work; needs heart-beat)
    
            // Leave room
            socket.leave(roomId);
    
            // Clean up room if empty
            const room = io.sockets.adapter.rooms.get(roomId);
            if (!room && !game.state.isInGame) {
              game.state.isAlive = false;
              await game.markModified('state');
              await game.save();
            } 
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // update points (and check longest road / largest army status)
    const updatePoints = async (gameId) => {
      console.log("updating points");
      const game = await Game.findById(gameId);
    
      if (!game) {
        console.error("Game not found:", gameId);
        return;
      }
    
      let longestRoadPlayer = null;
      let newLongestRoadPlayer = null;
      let minLongestRoad = 4;
      let largestArmyPlayer = null;
      let newLargestArmyPlayer = null;
      let minLargestArmy = 2;
    
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
    
      game.state.players.forEach(player => {
        if (player.roadLength > minLongestRoad) {
          if (longestRoadPlayer && longestRoadPlayer !== player.username) {
            const prevHolder = game.state.players.find(p => p.username === longestRoadPlayer);
            if (prevHolder) prevHolder.longestRoad = false;
          }
          player.longestRoad = true;
          longestRoadPlayer = player.username;
          minLongestRoad = player.roadLength;
          newLongestRoadPlayer = player.username;
        }
    
        if (player.knightCount > minLargestArmy) {
          if (largestArmyPlayer && largestArmyPlayer !== player.username) {
            const prevHolder = game.state.players.find(p => p.username === largestArmyPlayer);
            if (prevHolder) prevHolder.largestArmy = false;
          }
          player.largestArmy = true;
          largestArmyPlayer = player.username;
          minLargestArmy = player.knightCount;
          newLargestArmyPlayer = player.username;
        }
      });
    
      game.state.players.forEach(player => {
        player.points = 0;
    
        game.state.settlements.forEach(settlement => {
          if (settlement.username === player.username) {
            player.points += settlement.isCity ? 2 : 1;
          }
        });
    
        player.points += player.inventory.victoryPoint || 0;
        if (player.longestRoad) player.points += 2;
        if (player.largestArmy) player.points += 2;
      });
    
      game.markModified('state');
      const updatedGame = await game.save();
      io.to(gameId).emit('stateUpdated', updatedGame.state);
      console.log('Points updated');
    
      if (newLongestRoadPlayer) {
        await sendSystemMessage(gameId, `${newLongestRoadPlayer} acquired the longest road!`);
      }
      if (newLargestArmyPlayer) {
        await sendSystemMessage(gameId, `${newLargestArmyPlayer} acquired the largest army!`);
      }
    
      updatedGame.state.players.forEach(player => {
        if (player.points >= 10) {
          //convert to stand-alone so this can be async
          sendSystemMessage(gameId, `${player.username} won!`);
          io.to(gameId).emit('endGame');
        }
      });
    };
    
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
      io.to(gameId).emit('stateUpdated', updatedGame.state);
    }

  });//io.on('connection', (socket) => {
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
async function shuffleBoard(gameId) {
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

  return game
}

// Roll dice
const crypto = require('crypto');
async function rollDice() {
  console.log("running roll dice");

  const getRandomDie = () => {
    const randomBytes = crypto.randomBytes(1);
    return (randomBytes[0] % 6) + 1;
  };
  const die1 = getRandomDie();
  const die2 = getRandomDie();
  const dice = [
    { value: die1, src: `/images/dice/${die1}.png`, alt: `Die: ${die1}` },
    { value: die2, src: `/images/dice/${die2}.png`, alt: `Die: ${die2}` }
  ];

  return dice;
}

// Calculate Longest Road (Path of Roads)
function calculateLongestRoad(roads, username) {
  const userRoads = roads.filter(road => road.username === username);
  let paths = [];

  //todo: if any road segment is bisected by a settlement, the road ends

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

    //include roads adjacent to enemy settlements as dead ends
  
  });

  // For each path, look at the last element in the path, and check if any of possibleAdjacents includes any of the userRoads not already in the current path. If there are more than one matches, branch into a new path.
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

          //kill path if adjacency requires passing through enemy settlement

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
