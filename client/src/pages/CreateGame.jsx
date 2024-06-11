import { useNavigate } from 'react-router-dom';
import Auth from '../utils/auth';

const CreateGame = () => {
  const navigate = useNavigate();
  const { username } = Auth.getProfile().data;

  const handleCreateGame = () => {
    navigate('/game-board', { state: { isHost: true } });
  };

  return (
    <div className="create-game-container">
      <div className="card">
        <h1>Create New Game</h1>
        <button onClick={handleCreateGame}>Create Game</button>
      </div>
    </div>
  );
};

export default CreateGame;
