import React, { useEffect, useState } from 'react';
import { initializeSocket, getSocket } from '../socket';
import Auth from '../utils/auth';
import './CreateGame.css';

const CreateGame = () => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [seats, setSeats] = useState(Array(4).fill(null));
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isHost, setIsHost] = useState(true);
  const { username } = Auth.getProfile().data;
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState({
    id: '',
    messages: [],
    seats: Array(4).fill(null),
  });

  useEffect(() => {
    const token = Auth.getToken();
    const socket = initializeSocket(token);

    socket.emit('createGame', (createdGameId) => {
      console.log('Game created with ID:', createdGameId);
      setGameId(createdGameId);
      socket.emit('joinGame', createdGameId);
    });

    socket.on('users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('stateUpdated', (updatedState) => {
      setGameState((prevGameState) => ({
        ...prevGameState,
        ...updatedState,
        messages: [...prevGameState.messages, ...updatedState.messages],
      }));
      setSeats(updatedState.seats);
      setMessages((prevMessages) => [...prevMessages, ...updatedState.messages.filter(msg => !prevMessages.some(m => m.timestamp === msg.timestamp))]);
      console.log('State updated:', updatedState);
    });

    socket.on('games', (games) => {
      console.log('Games:', games);
    });

    return () => {
      socket.off('users');
      socket.off('stateUpdated');
      socket.off('games');
    };
  }, []);

  const handlePlayerChange = (e) => {
    if (isHost) {
      const value = parseInt(e.target.value, 10);
      if (value >= 2 && value <= 4) {
        setNumPlayers(value);
        const socket = getSocket();
        socket.emit('updateGameState', gameId, { numSeats: value });
      }
    }
  };

  const handleSitDown = (index) => {
    const socket = getSocket();
    if (seats[index] === username) {
      socket.emit('updateGameState', gameId, { seats: seats.map((seat, idx) => (idx === index ? null : seat)) });
    } else {
      socket.emit('updateGameState', gameId, { seats: seats.map((seat, idx) => (idx === index ? username : seat)) });
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

  const handleStartGame = () => {
    if (seats.slice(0, numPlayers).every((seat) => seat !== null)) {
      const socket = getSocket();
      socket.emit('updateGameState', gameId, { isStarted: true });
    }
  };

  return (
    <div className="create-game-container">
      <h1>Create New Game</h1>

      <div className="main-content">
        <div className="seats-container">
          {isHost && (
            <div className="player-count">
              <label htmlFor="numPlayers">Number of Players: </label>
              <input
                type="number"
                id="numPlayers"
                value={numPlayers}
                min="2"
                max="4"
                onChange={handlePlayerChange}
              />
            </div>
          )}
          {seats.slice(0, numPlayers).map((seat, index) => (
            <div
              key={index}
              className="seat"
              onClick={() => handleSitDown(index)}
            >
              {seat ? `Player ${seat}` : 'Empty Seat'}
            </div>
          ))}

          <div className="bottom-button">
            {isHost && seats.slice(0, numPlayers).every((seat) => seat !== null) && (
              <button className="start-game-button" onClick={handleStartGame}>
                Start Game
              </button>
            )}
          </div>
        </div>

        <div className="right-column">
          <div className="sidebar">
            <h2>Connected Users</h2>
            <ul>
              {users.map((user, index) => (
                <li key={index}>{user.username}</li>
              ))}
            </ul>
          </div>
          <div className="chat-container">
            <h2>Chat</h2>
            <div className="chat-feed">
              {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                  {msg.author}: {msg.body}
                </div>
              ))}
            </div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;
