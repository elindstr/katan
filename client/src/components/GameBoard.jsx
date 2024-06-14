//Gameboard.jsx
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeSocket, getSocket } from '../socket';
import Auth from '../utils/auth';

import Board from './Board';
import Seats from './Seats';
import UserPanel from './UserPanel';
import TradePanel from './TradePanel';
import Chat from './Chat';
import Dice from './Dice';
import Options from './Options';


function App() {
  const referralState = useLocation().state
  const [gameId, setGameId] = useState([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [seats, setSeats] = useState(Array(4).fill(null));
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);
  const { username } = Auth.getProfile().data;
  const [userColor, setUserColor] = useState('black');
  const [userData, setUserData] = useState(null)
  
  const [dice, setDice] = useState([]);
  const [hexes, setHexes] = useState([]);
  const [roads, setRoads] = useState([]);
  const [ports, setPorts] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [isBuildingRoad, setIsBuildingRoad] = useState(false);
  const [isBuildingRoadTwice, setIsBuildingRoadTwice] = useState(false);
  const [isBuildingSettlement, setIsBuildingSettlement] = useState(false);
  const [isBuildingCity, setIsBuildingCity] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);

  const [robberStep, setRobberStep] = useState(null);
  const [robberHexTarget, setRobberHexTarget] = useState(null);
  const [robberPlayerTarget, setRobberPlayerTarget] = useState(null);

  useEffect(() => {
    const token = Auth.getToken();
    const socket = initializeSocket(token);

    if (referralState?.isHost) {
      socket.emit('createGame', (createdGameId) => {
        // console.log('Game created with ID:', createdGameId);
        setGameId(createdGameId);
        socket.emit('joinGame', createdGameId);
      });
    } else {
      // console.log('Joining GameId:', referralState.gameId);
      socket.emit('joinGame', referralState.gameId);
      setGameId(referralState.gameId);
    }

    socket.on('users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('stateUpdated', (updatedState) => {
      console.log('State updated:', updatedState);

      // store states
      setSeats(updatedState.seats || Array(updatedState.numSeats).fill(null));
      setMessages(updatedState.messages || []);      
      setHexes(updatedState.hexes)
      setPorts(updatedState.ports)
      setRoads(updatedState.roads)
      setSettlements(updatedState.settlements)
      setDice(updatedState.dice)

      const playerData = updatedState.players.find(player => player.username === username);
      setUserData(playerData);
    });

    // building authorization
    socket.on('isBuildingRoad', (userColor) => {
      setUserColor(userColor)
      setIsBuildingRoad(true);
      setCurrentMessage('Place your road.')
      //todo: hide other control buttons; create a 'cancel' button that restores default state buttons
    });
    socket.on('isBuildingRoadTwice', (userColor) => {
      setUserColor(userColor)
      setIsBuildingRoadTwice(true);
      setCurrentMessage('Place two roads.')
      //todo: hide other control buttons; create a 'cancel' button that restores default state buttons
    });

    socket.on('isBuildingSettlement', (userColor) => {
      setUserColor(userColor)
      setIsBuildingSettlement(true);
      setCurrentMessage('Place your settlement.')
    });
    socket.on('isBuildingCity', (userColor) => {
      setUserColor(userColor)
      setIsBuildingCity(true);
      setCurrentMessage('Place your city.')
    });

    // steal authorization
    socket.on('robberAuth', () => {
      console.log('robberAuth');
      setCurrentMessage('Select Hex to Move Robber');
      setRobberStep('robberSelectHex');
    });

    // receiving trade offer
    socket.on('sendOffer', (offer) => {
      setCurrentOffer(offer)
    });

    // clean up on dismount
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
    if (seats[index] === username) {
      socket.emit('updateGameState', gameId, { seats: seats.map((seat, idx) => (idx === index ? null : seat)) });
    } else if (!seats.includes(username)) {
      socket.emit('updateGameState', gameId, { seats: seats.map((seat, idx) => (idx === index ? username : seat)) });
    } else {
      console.log('You are already seated.');
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

  // user actions
  const handleAction = (action, arg1) => {
    const socket = getSocket();
    socket.emit('handleAction', gameId, action, arg1);
  };
  const handleBuildAction = (type, id) => {
    const socket = getSocket();

    if (type == "isBuildingRoadTwice") {
      const typeMutation = "road"   
      socket.emit('handleBuildAction', gameId, typeMutation, id);
      setIsBuildingRoadTwice(false)
      setIsBuildingRoad(true)
    }

    else {
      setCurrentMessage('')
      setIsBuildingRoad(false)
      setIsBuildingRoadTwice(false)
      setIsBuildingSettlement(false)
      setIsBuildingCity(false)
      socket.emit('handleBuildAction', gameId, type, id);
    }
  };
  const handleTradeOffer = (offer) => {
    setIsTrading(false)
    const socket = getSocket();
    socket.emit('makeOffer', gameId, offer);
  }
  const handleTradeResponse = (response) => {
    if (response == 'accept') {
      const socket = getSocket();
      socket.emit('acceptOffer', gameId, currentOffer);
    }
    setIsTrading(false)
    setCurrentOffer(null)
  }

  // robber
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

  const handleOptionChange = (option) => {
    // Logic to handle options drop down
  };

  // trigger incoming trade offer 
  useEffect(() => {
    if (currentOffer) {
      setIsTrading(true)
    }
  }, [currentOffer]);

  return (<>
    <div className="app">
      <div className="main-column">
        
        <Seats numPlayers={numPlayers} seats={seats} handleSitDown={handleSitDown} />
        
        <Board 
          hexes={hexes}
          ports={ports}
          roads={roads}
          settlements={settlements}
          handleBuildAction={handleBuildAction}
          isBuildingRoad={isBuildingRoad}
          isBuildingRoadTwice={isBuildingRoadTwice}
          isBuildingSettlement={isBuildingSettlement}
          isBuildingCity={isBuildingCity}
          userColor={userColor}
          inventoryResources={userData ? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }}
          inventoryMaterials={userData ? userData.inventory : { knight: 0, victoryPoint: 0, roadBuilding: 0, yearOfPlenty: 0, monopoly: 0, roads: 15, settlements: 5, cities: 4  }}
          userData={userData}
          handleRobberHexClick={handleRobberHexClick} 
          handleRobberPlayerClick={handleRobberPlayerClick}
        />

        {!isTrading?
          <UserPanel
            currentMessage={currentMessage}
            handleAction={handleAction}
            userData={userData? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0, knight: 0, victoryPoint: 0, roadBuilding: 0, yearOfPlenty: 0, monopoly: 0, roads: 15, settlements: 5, cities: 4 }}
            setIsTrading={setIsTrading} 
          />
          :
          <TradePanel 
          userData={userData? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }} 
          setIsTrading={setIsTrading}
          handleTradeOffer={handleTradeOffer}
          currentOffer={currentOffer}
          handleTradeResponse={handleTradeResponse}
          />}

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
        />

      </div>
    </div>
    
  </>);
}

export default App;
