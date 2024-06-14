import { useState, useEffect } from 'react';

function UserPanel({ currentMessage, userData, handleAction, setIsTrading }) {
  const [isPlayingYearofPlenty, setIsPlayingYearofPlenty] = useState(false);
  const [isPlayingMonopoly, setIsPlayingMonopoly] = useState(false);
  const [chosenResources, setChosenResources] = useState({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });

  const chooseResource = (resource) => {
    if (isPlayingYearofPlenty) {
      setChosenResources((prev) => {
        const newResources = {
          ...prev,
          [resource]: prev[resource] + 1,
        };
        const totalChosen = Object.values(newResources).reduce((acc, val) => acc + val, 0);
        if (totalChosen >= 2) {
          handleAction('Play Year of Plenty Card', newResources);
          resetState();
        }
        return newResources;
      });
    } else if (isPlayingMonopoly) {
      handleAction('Play Monopoly Card', resource);
      resetState();
    }
  };

  const resetState = () => {
    setIsPlayingYearofPlenty(false);
    setIsPlayingMonopoly(false);
    setChosenResources({
      wood: 0,
      brick: 0,
      sheep: 0,
      wheat: 0,
      ore: 0,
    });
  };

  useEffect(() => {
    if (!isPlayingYearofPlenty && !isPlayingMonopoly) {
      resetState();
    }
  }, [isPlayingYearofPlenty, isPlayingMonopoly]);

  if (!userData) {
    return null;
  }

  const playCard = (cardType) => {
    if (cardType === 'Year of Plenty') {
      setIsPlayingYearofPlenty(true);
    } else if (cardType === 'Monopoly') {
      setIsPlayingMonopoly(true);
    } else {
      handleAction(`Play ${cardType}`);
    }
  };

  return (
    <div className="user-panel">
      <div className="development-cards">
        <h4>Development Cards</h4>
        <div>Points: {userData.victoryPoint}</div>
        <div>Knights: {userData.knight} <button onClick={() => playCard('Knight')}>Play</button></div>
        <div>Road Building: {userData.roadBuilding} <button onClick={() => playCard('Road Building')}>Play</button></div>
        <div>Year of Plenty: {userData.yearOfPlenty} <button onClick={() => playCard('Year of Plenty')}>Play</button></div>
        <div>Monopoly: {userData.monopoly} <button onClick={() => playCard('Monopoly')}>Play</button></div>
      </div>

      <div className="actions">
        {isPlayingMonopoly && (
          <>
            <h4>Select the resource to steal:</h4>
            <div className="resource-buttons">
              {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
                <button key={resource} onClick={() => chooseResource(resource)}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </button>
              ))}
            </div>
          </>
        )}

        {isPlayingYearofPlenty && (
          <>
            <h4>Select two resources:</h4>
            <div className="resource-buttons">
              {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
                <button key={resource} onClick={() => chooseResource(resource)}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)} ({chosenResources[resource]})
                </button>
              ))}
            </div>
          </>
        )}

        {(isPlayingYearofPlenty || isPlayingMonopoly) ? null : (
          currentMessage ? (
            <div>{currentMessage}</div>
          ) : (
            <>
              <h4>Actions</h4>
              <div className="actions-grid">
                <button onClick={() => handleAction('Build Road')}>Build Road</button>
                <button onClick={() => handleAction('Build Settlement')}>Build Settlement</button>
                <button onClick={() => handleAction('Build City')}>Build City</button>
                <button onClick={() => handleAction('Buy Development Card')}>Buy Development Card</button>
                <button onClick={() => setIsTrading(true)}>Trade</button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

export default UserPanel;
