import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeSocket, getSocket } from '../socket';
import Auth from '../utils/auth';
// import './GameBoard.css';

const GameBoard = () => {
  const { state } = useLocation();
  const { gameId, isHost } = state || {};
  const [numPlayers, setNumPlayers] = useState(4);
  const [seats, setSeats] = useState(Array(4).fill(null));
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const { username } = Auth.getProfile().data;
  const chatEndRef = useRef(null);

  useEffect(() => {
    const token = Auth.getToken();
    const socket = initializeSocket(token);

    if (isHost) {
      socket.emit('createGame', (createdGameId) => {
        console.log('Game created with ID:', createdGameId);
        setGameId(createdGameId);  // Update gameId state
        socket.emit('joinGame', createdGameId);
      });
    } else {
      socket.emit('joinGame', gameId);
    }

    socket.on('users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('stateUpdated', (updatedState) => {
      setSeats(updatedState.seats || Array(numPlayers).fill(null)); // Ensure seats is defined
      setMessages(updatedState.messages || []); // Ensure messages is defined
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
  }, [gameId, isHost]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const handleStartGame = () => {
    if (seats.slice(0, numPlayers).every((seat) => seat !== null)) {
      const socket = getSocket();
      socket.emit('updateGameState', gameId, { isStarted: true });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="game-board-container">
      <h1>Game Board</h1>

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
              <div ref={chatEndRef} />
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
