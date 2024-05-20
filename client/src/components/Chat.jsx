import React, { useState } from 'react';

const Chat = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    onSendMessage(message);
    setMessage('');
  };

  return (
    <div className="chat-container">
      <h2>Chat</h2>
      <div className="chat-feed">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.author}</strong>: {msg.body}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Chat;
