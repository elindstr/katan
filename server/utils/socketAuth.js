const { decodeToken } = require('./auth');

const socketAuth = (socket, next) => {
  console.log('Handshake auth:', socket.handshake.auth);
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log('No token provided');
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      console.log('Invalid token');
      return next(new Error('Authentication error: Invalid token'));
    }

    socket.userId = decoded.data._id;
    socket.username = decoded.data.username;
    console.log('Username derived from token:', socket.username);
    next();
    
  } catch (err) {
    console.log('Invalid token');
    next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = socketAuth;
