// UserPanel.jsx
function UserPanel({ currentMessage, userData, handleAction }) {
  if (!userData) {
    return null;
  }

  const playCard = (cardType) => {
    handleAction(`Play ${cardType}`);
  };

  return (
    <div className="user-panel">
      <div className="development-cards">
        <h4>Development Cards</h4>
        <div>Knights: {userData.knight} <button onClick={() => playCard('Knight')}>Play</button></div>
        <div>Victory Points: {userData.victoryPoint}</div>
        <div>Road Building: {userData.roadBuilding} <button onClick={() => playCard('Road Building')}>Play</button></div>
        <div>Year of Plenty: {userData.yearOfPlenty} <button onClick={() => playCard('Year of Plenty')}>Play</button></div>
        <div>Monopoly: {userData.monopoly} <button onClick={() => playCard('Monopoly')}>Play</button></div>
      </div>

      <div className="actions">
        <h4>Actions</h4>
        <div className="actions-grid">
          <button onClick={() => handleAction('Build Road')}>Build Road</button>
          <button onClick={() => handleAction('Build Settlement')}>Build Settlement</button>
          <button onClick={() => handleAction('Build City')}>Build City</button>
          <button onClick={() => handleAction('Buy Development Card')}>Buy Development Card</button>
          <button onClick={() => handleAction('Trade')}>Trade</button>
        </div>
      </div>
    </div>
  );
}

export default UserPanel;
