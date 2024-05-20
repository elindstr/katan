import React, { useState, useEffect } from 'react';
import socket from '../socket';
import './JoinGame.css';

const JoinGame = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    socket.on('games', (updatedGames) => {
      console.log('Received games:', updatedGames); // Debug log
      setGames(updatedGames);
    });

    // Request the current list of games when the component mounts
    socket.emit('requestGames');

    return () => {
      socket.off('games');
    };
  }, []);

  const handleJoinGame = (gameId) => {
    socket.emit('joinGame', gameId);
  };

  return (
    <div className="join-game-container">
      <h1>Join a Game</h1>
      <ul className="game-list">
        {games.map((game) => (
          <li key={game.id} className="game-item">
            <div>
              <strong>Host:</strong> {game.host}
            </div>
            <div>
              <strong>Seats:</strong> {game.seats.filter((seat) => seat === null).length} open
            </div>
            <button onClick={() => handleJoinGame(game.id)}>Join Game</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JoinGame;
