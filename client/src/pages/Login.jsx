//login.jsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGIN, ADD_USER } from '../utils/mutations';
import { QUERY_USERS } from '../utils/queries';
import Auth from '../utils/auth';
import './Login.css';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formState, setFormState] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const navigate = useNavigate();
  const { loading, data } = useQuery(QUERY_USERS);
  const [login, { error: loginError }] = useMutation(LOGIN);
  const [addUser, { error: signupError }] = useMutation(ADD_USER);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        // Check if username is already taken
        if (data && data.users.some(user => user.username === formState.username)) {
          alert('Username is already taken. Please choose another one.');
          return;
        }
        const mutationResponse = await addUser({
          variables: {
            username: formState.username,
            password: formState.password,
            firstName: formState.firstName,
            lastName: formState.lastName
          }
        });
        const token = mutationResponse.data.addUser.token;
        Auth.login(token);
      } else {
        const mutationResponse = await login({
          variables: { username: formState.username, password: formState.password }
        });
        const token = mutationResponse.data.login.token;
        Auth.login(token);

      }
      console.log("redirecting to dashboard")
      navigate('/'); // Redirect to dashboard
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="landing-page">
      <div className="card">
        <h1>Katan</h1>
        <form onSubmit={handleFormSubmit}>
          {isSignup && (
            <>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formState.firstName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formState.lastName}
                onChange={handleInputChange}
                required
              />
            </>
          )}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formState.username}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formState.password}
            onChange={handleInputChange}
            required
          />
          {loginError || signupError ? (
            <div>
              <p className="error-text">The provided credentials are incorrect</p>
            </div>
          ) : null}
          <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
        </form>
        <button className="toggle-button" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Switch to Login' : 'Switch to Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default Login;
