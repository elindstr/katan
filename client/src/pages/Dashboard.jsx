import { useNavigate } from 'react-router-dom';
import Auth from '../utils/auth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { username } = Auth.getProfile().data;

  const handleLogout = () => {
    Auth.logout();
    navigate('/login');
  };
 
  return (
    <div className="dashboard-page">
      <div className="card">
        <div className="card-header">
          <h1>Katan</h1>
          <div className="username-display">Username: {username}</div>
        </div>
        <button onClick={() => navigate('/update-profile')}>Update Profile</button>
        <button onClick={() => navigate('/create-game')}>Create Game</button>
        <button onClick={() => navigate('/join-game')}>Join Game</button>
        <button onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
};

export default Dashboard;
