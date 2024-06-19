import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeSocket, getSocket } from '../socket';
import { useNavigate } from 'react-router-dom';
import Auth from '../utils/auth';

import Board from './Board';
import Seats from './Seats';
import UserPanel from './UserPanel';
import TradePanel from './TradePanel';
import TradeWithBankPanel from './TradeWithBankPanel';
import Chat from './Chat';
import Dice from './Dice';
import Options from './Options';

function App() {
  const navigate = useNavigate();
  const referralState = useLocation().state;
  const [gameId, setGameId] = useState([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [seats, setSeats] = useState(Array(4).fill(null));
  const [seatsObject, setSeatsObject] = useState(Array(4).fill({ username: null, socketId: null }));
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);
  const { username } = Auth.getProfile().data;
  const [userColor, setUserColor] = useState('black');
  const [userData, setUserData] = useState(null);

  const [currentMessage, setCurrentMessage] = useState(null);
  const [dice, setDice] = useState([]);
  const [hexes, setHexes] = useState([]);
  const [roads, setRoads] = useState([]);
  const [ports, setPorts] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [isBuildingRoad, setIsBuildingRoad] = useState(false);
  const [isBuildingRoadOneOfTwo, setIsBuildingRoadOneOfTwo] = useState(false);
  const [isBuildingRoadTwoOfTwo, setIsBuildingRoadTwoOfTwo] = useState(false);
  const [isBuildingSettlement, setIsBuildingSettlement] = useState(false);
  const [isBuildingCity, setIsBuildingCity] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [isTradingWithBank, setIsTradingWithBank] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [isRollingDice, setIsRollingDice] = useState(false);

  const [displayStartButton, setDisplayStartButton] = useState(false);
  const [displayDiceButton, setDisplayDiceButton] = useState(false);
  
  const [isInitialRoll, setInitialRoll] = useState(false);
  const [isInitialSettlementPlacement, setIsInitialSettlementPlacement] = useState(false);
  const [isInitialRoadPlacement, setIsInitialRoadPlacement] = useState(false);
  const [isLastBuiltSettlement, setIsLastBuiltSettlement] = useState(null);
  const [isFreeBuild, setIsFreeBuild] = useState(true);

  const [isMyTurn, setIsMyTurn] = useState(false);
  const [haveRolled, setHaveRolled] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(false);
  
  const [robberStep, setRobberStep] = useState(null);
  const [robberHexTarget, setRobberHexTarget] = useState(null);
  const [robberPlayerTarget, setRobberPlayerTarget] = useState(null);

  useEffect(() => {
    const token = Auth.getToken();
    const socket = initializeSocket(token);

    if (referralState?.isHost) {
      socket.emit('createGame', (createdGameId) => {
        setGameId(createdGameId);
        socket.emit('joinGame', createdGameId);
      });
    } else {
      socket.emit('joinGame', referralState.gameId);
      setGameId(referralState.gameId);
    }

    socket.on('users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('getInitialRoll', () => {
      setCurrentMessage("Roll dice to see who starts.")
      setInitialRoll(true)
    })
    socket.on('placeFirstSettlement', () => {
      setIsInitialSettlementPlacement(true)
      setCurrentMessage("Place first settlement.")
    })
    socket.on('placeFirstRoad', () => {
      setIsInitialRoadPlacement(true)
      setCurrentMessage("Place first road.")
    })
    socket.on('placeSecondSettlement', () => {
      setIsInitialSettlementPlacement(true)
      setCurrentMessage("Place second settlement.")
    })
    socket.on('placeSecondRoad', () => {
      setIsInitialRoadPlacement(true)
      setCurrentMessage("Place second road.")
    })

    socket.on('stateUpdated', (updatedState) => {
      console.log('State updated:', updatedState); //dev

      setSeats(updatedState.seats || Array(updatedState.numSeats).fill(null));
      setSeatsObject(updatedState.seatsObject || Array(updatedState.numSeats).fill({ username: null, socketId: null }));
      setNumPlayers(updatedState.numSeats)
      setMessages(updatedState.messages);
      setHexes(updatedState.hexes);
      setPorts(updatedState.ports);
      setRoads(updatedState.roads);
      setSettlements(updatedState.settlements);
      setDice(updatedState.dice);
      setCurrentTurn(updatedState.currentTurn)

      const playerData = updatedState.players.find(player => player.username === username);
      setUserData(playerData);

      if (!updatedState.isInGame && 
        !updatedState.isInInitialSetup && 
        referralState.isHost
        //todo: in production: add condition that requires 3-4 players
      ) {setDisplayStartButton(true)
      } else {setDisplayStartButton(false)}
      

      // game loop routing
      if ((updatedState.isInGame == true) &&
          (updatedState.currentTurn == playerData.turnOrder)) {

            setIsMyTurn(true)
            updatedState.haveRolled? setHaveRolled(true): setHaveRolled(false) 
          }
    });

    socket.on('isBuildingRoad', (userColor) => {
      setUserColor(userColor);
      setIsBuildingRoad(true);
      setCurrentMessage('Place your road.');
    });

    socket.on('isBuildingRoadTwice', (userColor) => {
      setUserColor(userColor);
      setIsBuildingRoadOneOfTwo(true);
      setCurrentMessage('Place two roads.');
    });

    socket.on('isBuildingSettlement', (userColor) => {
      setUserColor(userColor);
      setIsBuildingSettlement(true);
      setCurrentMessage('Place your settlement.');
    });

    socket.on('isBuildingCity', (userColor) => {
      setUserColor(userColor);
      setIsBuildingCity(true);
      setCurrentMessage('Place your city.');
    });

    socket.on('robberAuth', () => {
      // console.log('robberAuth');
      setCurrentMessage('Select Hex to Move Robber');
      setRobberStep('robberSelectHex');
    });

    socket.on('devCardSelected', (devCardSelected) => {
      //console.log('devCardSelected:', devCardSelected);
      alert(`You received a ${devCardSelected}! Non-point development cards will appear in your inventory at the end of your turn.`)
    });
    

    socket.on('sendOffer', (offer) => {
      setCurrentOffer(offer);
    });

    socket.on('endGame', () => {
      // console.log("game over");
      setCurrentMessage("game over");
    });

    return () => {
      socket.off('users');
      socket.off('stateUpdated');
      socket.off('games');
    };
  }, [referralState]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSitDown = (index) => {
    const socket = getSocket();
    const socketId = socket.id;

    if (seats[index] === username) {
      socket.emit('updateGameState', gameId, {
        seatsObject: seatsObject.map((seat, idx) => (idx === index ? { username: null, socketId: null } : seat))
      });
    } else if (!seats.includes(username)) {
      socket.emit('updateGameState', gameId, {
        seatsObject: seatsObject.map((seat, idx) => (idx === index ? { username, socketId } : seat))
      });
    } else {
      // console.log('You are already seated.');
    }
  };

  const handleSendMessage = () => {
    const socket = getSocket();
    const newMessage = {
      author: username,
      body: message,
      timestamp: Date.now(),
    };
    socket.emit('sendMessage', gameId, newMessage);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleAction = (action, arg1) => {
    const socket = getSocket();
    socket.emit('handleAction', gameId, action, arg1);

    // on start
    if (action === 'Start Game') {
      setGameStarted(true)
    }

    // resets
    setCurrentMessage("")
    setInitialRoll(false)
    setIsTrading(false)
  };

  const handleBuildAction = (type, id) => {
    const socket = getSocket();

    if (type === "isBuildingRoadOneOfTwo") {
      const typeMutation = "road";
      socket.emit('handleBuildAction', gameId, typeMutation, id, isFreeBuild);
      setCurrentMessage('');
      setIsBuildingRoadOneOfTwo(false);
      setIsBuildingRoadTwoOfTwo(true);

    } else if (type === "isBuildingRoadTwoOfTwo") {
      const typeMutation = "road";
      socket.emit('handleBuildAction', gameId, typeMutation, id, isFreeBuild);
      setCurrentMessage('');
      setIsBuildingRoadTwoOfTwo(false);
  
    } else if (type === "isInitialRoad") {
      const typeMutation = "isInitialRoad";
      socket.emit('handleBuildAction', gameId, typeMutation, id);
      setCurrentMessage('');
      setIsInitialRoadPlacement(false);
      
    } else if (type === "isInitialSettlement") {
      const typeMutation = "isInitialSettlement";
      socket.emit('handleBuildAction', gameId, typeMutation, id);
      setCurrentMessage('');
      setIsInitialSettlementPlacement(false);
      setIsLastBuiltSettlement(id)

    } else {
      setCurrentMessage('');
      setIsBuildingRoad(false);
      setIsBuildingSettlement(false);
      setIsBuildingCity(false);
      
      socket.emit('handleBuildAction', gameId, type, id);
    }
  };

  const handleTradeOffer = (offer) => {
    setIsTrading(false);
    const socket = getSocket();
    socket.emit('makeOffer', gameId, offer);
  };
  const bankTrade = (offer) => {
    setIsTrading(false);
    const socket = getSocket();
    socket.emit('bankTrade', gameId, offer);
  };
  

  const handleTradeResponse = (response) => {
    if (response === 'accept') {
      const socket = getSocket();
      socket.emit('acceptOffer', gameId, currentOffer);
    }
    setIsTrading(false);
    setCurrentOffer(null);
  };

  const handleRobberHexClick = (hexId) => {
    if (robberStep === 'robberSelectHex') {
      setRobberHexTarget(hexId);
      setCurrentMessage('Select Player From Whom To Steal');
      setRobberStep('robberSelectPlayer');
    }
  };

  const handleRobberPlayerClick = (username) => {
    if (robberStep === 'robberSelectPlayer') {
      setRobberPlayerTarget(username);
      const socket = getSocket();
      socket.emit('handleAction', gameId, 'Moved Robber', robberHexTarget, username);
      setRobberStep(null);
      setCurrentMessage('');
    }
  };

  const handleCancelBuild = () => {
    setCurrentMessage('');
    setIsBuildingRoad(false);
    setIsBuildingSettlement(false);
    setIsBuildingCity(false);
  };
  

  const handleOptionChange = (option) => {
    // Logic to handle options drop down
    console.log(option)
    if(option==='leaveRoom') {
      navigate('/dashboard')
    }
  };

  useEffect(() => {
    if (currentOffer) {
      setIsTrading(true);
    }
  }, [currentOffer]);

  return (
    <div className="app">
      <div className="main-column">
        <Seats 
          gameStarted={gameStarted}
          numPlayers={numPlayers} 
          seatsObject={seatsObject} 
          handleSitDown={handleSitDown}
          currentTurn={currentTurn} 
        />
        <Board 
          hexes={hexes}
          ports={ports}
          roads={roads}
          settlements={settlements}
          handleBuildAction={handleBuildAction}
          isBuildingRoad={isBuildingRoad}
          isBuildingRoadOneOfTwo={isBuildingRoadOneOfTwo}
          isBuildingRoadTwoOfTwo={isBuildingRoadTwoOfTwo}
          isBuildingSettlement={isBuildingSettlement}
          isBuildingCity={isBuildingCity}
          isInitialSettlementPlacement={isInitialSettlementPlacement}
          isInitialRoadPlacement={isInitialRoadPlacement}
          isLastBuiltSettlement={isLastBuiltSettlement}
          userColor={userColor}
          inventoryResources={userData ? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }}
          inventoryMaterials={userData ? userData.inventory : { knight: 0, victoryPoint: 0, roadBuilding: 0, yearOfPlenty: 0, monopoly: 0, roads: 15, settlements: 5, cities: 4  }}
          userData={userData}
          handleRobberHexClick={handleRobberHexClick} 
          handleRobberPlayerClick={handleRobberPlayerClick}
        />
        {!isTrading ? (
          <UserPanel
            currentMessage={currentMessage}
            handleAction={handleAction}
            userData={userData ? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0, knight: 0, victoryPoint: 0, roadBuilding: 0, yearOfPlenty: 0, monopoly: 0, roads: 15, settlements: 5, cities: 4 }}
            setIsTrading={setIsTrading} 
            isMyTurn={isMyTurn}
            haveRolled={haveRolled}
            handleCancelBuild={handleCancelBuild}
            isBuildingRoad={isBuildingRoad}
            isBuildingSettlement={isBuildingSettlement} 
            isBuildingCity={isBuildingCity}
          />
        ) : (
          !isTradingWithBank?
            <TradePanel 
              username={username}
              userData={userData ? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }} 
              setIsTrading={setIsTrading}
              setIsTradingWithBank={setIsTradingWithBank}
              handleTradeOffer={handleTradeOffer}
              currentOffer={currentOffer}
              handleTradeResponse={handleTradeResponse}
            />
          :
            <TradeWithBankPanel
              username={username}
              userPorts={userData? userData.ports: {hasWood: false, hasBrick: false, hasLumber: false, hasSheep: false, hasWheat: false, hasOre: false, hasWild: false
              }} 
              userData={userData? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }} 
              setIsTrading={setIsTrading}
              setIsTradingWithBank={setIsTradingWithBank}
              handleTradeOffer={handleTradeOffer}
              currentOffer={currentOffer}
              bankTrade={bankTrade}
            />
        )}
      </div>
      <div className="side-column">
        <Options handleOptionChange={handleOptionChange} />
        <Chat 
          users={users} 
          messages={messages} 
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          setMessage={setMessage}
          message={message}
        />
        <Dice 
          dice={dice} 
          handleDiceAction={(action) => handleAction(action)}
          isRollingDice={isRollingDice}
          isInitialRoll={isInitialRoll}
          haveRolled={haveRolled}
          displayStartButton={displayStartButton}
          displayDiceButton={displayDiceButton}
          isMyTurn={isMyTurn}
        />
      </div>
    </div>
  );
}

export default App;
