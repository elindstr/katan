//Gameboard.jsx
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeSocket, getSocket } from '../socket';
import Auth from '../utils/auth';

import Board from './Board';
import Seats from './Seats';
import UserPanel from './UserPanel';
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
  const [isBuildingSettlement, setIsBuildingSettlement] = useState(false);
  const [isBuildingCity, setIsBuildingCity] = useState(false);

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
      setSeats(updatedState.seats || Array(numPlayers).fill(null));
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
      //todo: hide other control buttons; create a 'cancel' button that restores default state buttons
    });
    socket.on('isBuildingSettlement', (userColor) => {
      setUserColor(userColor)
      setIsBuildingSettlement(true);
    });
    socket.on('isBuildingCity', (userColor) => {
      setUserColor(userColor)
      setIsBuildingCity(true);
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
  const handleAction = (action) => {
    const socket = getSocket();
    socket.emit('handleAction', gameId, action);
  };
  const handleBuildAction = (type, id) => {
    setIsBuildingRoad(false)
    setIsBuildingSettlement(false)
    setIsBuildingCity(false)
    const socket = getSocket();
    socket.emit('handleBuildAction', gameId, type, id);
  };

  const handleOptionChange = (option) => {
    // Logic to handle options drop down
  };

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
          isBuildingSettlement={isBuildingSettlement}
          isBuildingCity={isBuildingCity}
          userColor={userColor}
          inventoryResources={userData ? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 }}
          inventoryMaterials={userData ? userData.inventory : { knight: 0, victoryPoint: 0, roadBuilding: 0, yearOfPlenty: 0, monopoly: 0, roads: 15, settlements: 5, cities: 4  }}
          userData={userData}
        />

        <UserPanel 
          currentMessage="Current message"
          handleAction={handleAction}
          userData={userData? userData.inventory : { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0, knight: 0, victoryPoint: 0, roadBuilding: 0, yearOfPlenty: 0, monopoly: 0, roads: 15, settlements: 5, cities: 4 }}
        />
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
