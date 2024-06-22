import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeSocket } from '../socket';
import Auth from '../utils/auth';

const JoinGame = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Auth.getToken();
    const socket = initializeSocket(token);

    socket.emit('requestGames');

    socket.on('games', (games) => {
      console.log(games);
      setGames(games);
      setLoading(false);
    });

    return () => {
      socket.off('games');
    };
  }, []);

  const handleJoinGame = (gameId) => {
    navigate('/game-board', { state: { gameId, isHost: false } });
  };

  if (loading) {
    return <div>Loading games...</div>;
  }

  return (
    <div className="join-game-container card">
      <h1>Join a Game</h1>
      {games.length > 0 ? (
        <ul className="game-list">
          {games.map((game) => (
            <li key={game._id} className="game-item">
              <div>
                <strong>Host:</strong> {game.state.host}
              </div>
              <div>
                <strong>Created On:</strong> {new Date(game.state.createdOn).toLocaleString()}
              </div>
              <div>
                <strong>Users:</strong> {game.socketCount ? game.socketCount : 0}
              </div>
              <button onClick={() => handleJoinGame(game._id)}>Join Game</button>
            </li>
          ))}
        </ul>
      ) : (
        <div>No games available to join. Please check back later.</div>
      )}
    </div>
  );
};

export default JoinGame;
