import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initializeSocket, getSocket } from '../socket';
import Auth from '../utils/auth';

import Board from './Board';
import Seats from './Seats';
import UserPanel from './UserPanel';
import TradePanel from './TradePanel';
import TradeWithBankPanel from './TradeWithBankPanel';
import DiscardPanel from './DiscardPanel';
import Chat from './Chat';
import Dice from './Dice';
import Options from './Options';

const App = () => {
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
  const [isHandlingSeven, setIsHandlingSeven] = useState(null);
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
  const [knightIsLocked, setKnightIsLocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

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
      setCurrentMessage("Roll dice to see who starts.");
      setInitialRoll(true);
      setGameStarted(true);
    });
    socket.on('placeFirstSettlement', () => {
      setIsInitialSettlementPlacement(true);
      setCurrentMessage("Place first settlement.");
    });
    socket.on('placeFirstRoad', () => {
      setIsInitialRoadPlacement(true);
      setCurrentMessage("Place first road.");
    });
    socket.on('placeSecondSettlement', () => {
      setIsInitialSettlementPlacement(true);
      setCurrentMessage("Place second settlement.");
    });
    socket.on('placeSecondRoad', () => {
      setIsInitialRoadPlacement(true);
      setCurrentMessage("Place second road.");
    });

    socket.on('stateUpdated', (updatedState) => {
      console.log('State updated:', updatedState); //dev

      setSeats(updatedState.seats || Array(updatedState.numSeats).fill(null));
      setSeatsObject(updatedState.seatsObject || Array(updatedState.numSeats).fill({ username: null, socketId: null }));
      setNumPlayers(updatedState.numSeats);
      setMessages(updatedState.messages);
      setHexes(updatedState.hexes);
      setPorts(updatedState.ports);
      setRoads(updatedState.roads);
      setSettlements(updatedState.settlements);
      setDice(updatedState.dice);
      setCurrentTurn(updatedState.currentTurn);

      const playerData = updatedState.players.find(player => player.username === username);
      setUserData(playerData);

      if (
        !updatedState.isInGame &&
        !updatedState.isInInitialSetup &&
        referralState.isHost
      ) {
        setDisplayStartButton(true);
      } else {
        setDisplayStartButton(false);
      }

      if (
        updatedState.isInGame === true &&
        updatedState.currentTurn === playerData.turnOrder
      ) {
        setIsMyTurn(true);
        setHaveRolled(updatedState.haveRolled);
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
      setCurrentMessage('Select Hex to Move Robber');
      setRobberStep('robberSelectHex');
    });

    socket.on('devCardSelected', (devCardSelected) => {
      alert(`You received a ${devCardSelected}! Non-point development cards will appear in your inventory at the end of your turn.`);
    });

    socket.on('sendOffer', (offer) => {
      setCurrentOffer(offer);
    });

    socket.on('sevenRolled', (discardAmount) => {
      console.log(`Seven was rolled; discard half: ${discardAmount}`);
      setIsHandlingSeven(discardAmount);
    });

    socket.on('endGame', () => {
      setCurrentMessage("game over");
      setIsGameOver(true)
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

  const handleSitDown = useCallback((index) => {
    const socket = getSocket();
    const socketId = socket.id;

  // Check if the user is already seated at the specified index
  if (seatsObject[index]?.username === username) {
    // User is already seated at this position, so they stand up
    socket.emit('updateGameState', gameId, {
      seatsObject: seatsObject.map((seat, idx) =>
        idx === index ? { username: null, socketId: null } : seat
      ),
    });
  } else if (!seatsObject.some(seat => seat.username === username)) {
    // Check if the user is not seated and there is a free seat to sit down
    socket.emit('updateGameState', gameId, {
      seatsObject: seatsObject.map((seat, idx) =>
        idx === index ? { username, socketId } : seat
      ),
    });
  }
}, [gameId, seatsObject, username]);

  const handleSendMessage = useCallback(() => {
    const socket = getSocket();
    const newMessage = {
      author: username,
      body: message,
      timestamp: Date.now(),
    };
    socket.emit('sendMessage', gameId, newMessage);
    setMessage('');
  }, [gameId, message, username]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleAction = useCallback((action, arg1) => {
    const socket = getSocket();
    socket.emit('handleAction', gameId, action, arg1);

    if (action === 'Start Game') {
      // setGameStarted(true);
    }
    if (action === 'End Turn') {
      setIsMyTurn(false);
    }

    if (action === 'Play Knight') {
      setKnightIsLocked(true)
    }
    if (action === 'End Turn') {
      setKnightIsLocked(false)
    }

    setCurrentMessage('');
    setInitialRoll(false);
    setIsTrading(false);
  }, [gameId]);

  const handleBuildAction = useCallback((type, id) => {
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
      setIsLastBuiltSettlement(id);

    } else {
      setCurrentMessage('');
      setIsBuildingRoad(false);
      setIsBuildingSettlement(false);
      setIsBuildingCity(false);

      socket.emit('handleBuildAction', gameId, type, id);
    }
  }, [gameId, isFreeBuild]);

  const handleTradeOffer = useCallback((offer) => {
    setIsTrading(false);
    const socket = getSocket();
    socket.emit('makeOffer', gameId, offer);
  }, [gameId]);

  const bankTrade = useCallback((offer) => {
    setIsTrading(false);
    const socket = getSocket();
    socket.emit('bankTrade', gameId, offer);
  }, [gameId]);

  const handleTradeResponse = useCallback((response) => {
    if (response === 'accept') {
      const socket = getSocket();
      socket.emit('acceptOffer', gameId, currentOffer);
    }
    setIsTrading(false);
    setCurrentOffer(null);
  }, [currentOffer, gameId]);

  const handleRobberHexClick = useCallback((hexId) => {
    if (robberStep === 'robberSelectHex') {
      setRobberHexTarget(hexId);
      setCurrentMessage('Select Player From Whom To Steal');
      setRobberStep('robberSelectPlayer');
    }
  }, [robberStep]);

  const handleRobberPlayerClick = useCallback((username) => {
    if (robberStep === 'robberSelectPlayer') {
      setRobberPlayerTarget(username);
      const socket = getSocket();
      socket.emit('handleAction', gameId, 'Moved Robber', robberHexTarget, username);
      setRobberStep(null);
      setCurrentMessage('');
    }
  }, [gameId, robberHexTarget, robberStep]);

  const handleCancelBuild = useCallback(() => {
    setCurrentMessage('');
    setIsBuildingRoad(false);
    setIsBuildingSettlement(false);
    setIsBuildingCity(false);
  }, []);

  const handleDiscard = useCallback((giving) => {
    setIsHandlingSeven(null);
    const socket = getSocket();
    socket.emit('reportingDiscard', gameId, giving);
  }, [gameId]);

  const handleOptionChange = useCallback((option) => {
    if (option === 'leaveRoom') {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentOffer) {
      setIsTrading(true);
    }
  }, [currentOffer]);

  const userInventory = useMemo(() => (userData ? userData.inventory : {
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
    knight: 0,
    victoryPoint: 0,
    roadBuilding: 0,
    yearOfPlenty: 0,
    monopoly: 0,
    roads: 15,
    settlements: 5,
    cities: 4
  }), [userData]);

  const userPorts = useMemo(() => (userData ? userData.ports : {
    hasWood: false,
    hasBrick: false,
    hasLumber: false,
    hasSheep: false,
    hasWheat: false,
    hasOre: false,
    hasWild: false
  }), [userData]);

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
          inventoryResources={userInventory}
          inventoryMaterials={userInventory}
          userData={userData}
          handleRobberHexClick={handleRobberHexClick}
          handleRobberPlayerClick={handleRobberPlayerClick}
        />
        {isHandlingSeven ?
          <DiscardPanel
            isHandlingSeven={isHandlingSeven}
            userData={userInventory}
            handleDiscard={handleDiscard}
          />
          :
          (!isTrading ? (
            <UserPanel
              currentMessage={currentMessage}
              handleAction={handleAction}
              userData={userInventory}
              setIsTrading={setIsTrading}
              isMyTurn={isMyTurn}
              haveRolled={haveRolled}
              handleCancelBuild={handleCancelBuild}
              isBuildingRoad={isBuildingRoad}
              isBuildingSettlement={isBuildingSettlement}
              isBuildingCity={isBuildingCity}
            />
          ) : (
            !isTradingWithBank ?
              <TradePanel
                username={username}
                userData={userInventory}
                setIsTrading={setIsTrading}
                setIsTradingWithBank={setIsTradingWithBank}
                handleTradeOffer={handleTradeOffer}
                currentOffer={currentOffer}
                handleTradeResponse={handleTradeResponse}
              />
              :
              <TradeWithBankPanel
                username={username}
                userPorts={userPorts}
                userData={userInventory}
                setIsTrading={setIsTrading}
                setIsTradingWithBank={setIsTradingWithBank}
                handleTradeOffer={handleTradeOffer}
                currentOffer={currentOffer}
                bankTrade={bankTrade}
              />
          )
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
          handleDiceAction={handleAction}
          isRollingDice={isRollingDice}
          isInitialRoll={isInitialRoll}
          haveRolled={haveRolled}
          displayStartButton={displayStartButton}
          displayDiceButton={displayDiceButton}
          isMyTurn={isMyTurn}
          isHandlingSeven={isHandlingSeven}
          robberStep={robberStep}
          isGameOver={isGameOver}
        />
      </div>
    </div>
  );
};

export default App;
