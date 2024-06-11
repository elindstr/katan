// Chat.jsx
function Chat({ users, messages, handleSendMessage, handleKeyPress, setMessage, message }) {

  const sendMessage = () => {
    handleSendMessage(message);
    setMessage('');
  };

  return (
    <div className="chat">
      <div className="chat-users">
        <h3>Current Users</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
      <div className="chat-messages">
        <h3>Chat Messages</h3>
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index}>
              <strong>{msg.author}</strong>: {msg.body}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Enter message"
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
