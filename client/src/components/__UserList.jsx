import React from 'react';

const UserList = ({ users }) => {
  return (
    <div className="sidebar">
      <h2>Connected Users</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
