import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_USERNAME } from '../utils/mutations';
import { QUERY_USER } from '../utils/queries';
import Auth from '../utils/auth';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [updateUser] = useMutation(UPDATE_USERNAME);
  const { loading, data } = useQuery(QUERY_USER);
  const [formState, setFormState] = useState({
    username: '',
  });

  useEffect(() => {
    if (data) {
      setFormState({
        username: data.user.username,
      });
      console.log(data)
    }
  }, [data]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser({
        variables: {
          username: formState.username,
        },
      });
      navigate('/'); // Navigate back to dashboard after successful update
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="card">
        <h1>Update Username</h1>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formState.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleSaveProfile}
          >
            Save
          </button>
        </div>
        <button onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default UpdateProfile;
