import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UpdateProfile from './pages/UpdateProfile';
import Auth from './utils/auth';
import "./App.css"

const CreateGame = React.lazy(() => import('./pages/CreateGame'));
const JoinGame = React.lazy(() => import('./pages/JoinGame'));
const GameBoard = React.lazy(() => import('./components/GameBoard')); // Assuming GameBoard is in the pages directory

const PrivateRoute = ({ element }) => {
  return Auth.loggedIn() ? element : <Navigate to="/login" />;
};

const PublicRoute = ({ element }) => {
  return Auth.loggedIn() ? <Navigate to="/" /> : element;
};

const NotFoundRedirect = () => {
  return Auth.loggedIn() ? <Navigate to="/" /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/update-profile" element={<PrivateRoute element={<UpdateProfile />} />} />
          <Route path="/create-game" element={<PrivateRoute element={<CreateGame />} />} />
          <Route path="/join-game" element={<PrivateRoute element={<JoinGame />} />} />
          <Route path="/game-board" element={<PrivateRoute element={<GameBoard />} />} />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
