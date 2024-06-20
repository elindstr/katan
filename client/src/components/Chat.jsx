// Chat.jsx
import { useRef, useEffect } from "react";

function Chat({ users, messages, handleSendMessage, handleKeyPress, setMessage, message }) {
  const messagesEndRef = useRef(null);

  const systemStyle = {
    color: 'darkred'
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    handleSendMessage(message);
    setMessage('');
  };

  return (
    <div className="chat">
      <div className="chat-users">
        <h3>Users</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
      <div className="chat-messages">
        <h3>Chat</h3>
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className="message" style={msg.type?systemStyle: null}>
              <strong>{msg.author}</strong>: {msg.body}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="type message"
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
