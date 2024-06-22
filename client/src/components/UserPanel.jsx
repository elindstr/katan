// UserPanel.jsx
import { useState, useEffect } from 'react';

function UserPanel({ currentMessage, userData, handleAction, setIsTrading, isMyTurn, haveRolled, handleCancelBuild, isBuildingRoad, isBuildingSettlement, isBuildingCity }) {

  const [isPlayingYearofPlenty, setIsPlayingYearofPlenty] = useState(false);
  const [isPlayingMonopoly, setIsPlayingMonopoly] = useState(false);

  const [chosenResources, setChosenResources] = useState({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });

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

  const playCard = (cardType) => {
    if (cardType === 'Year of Plenty') {
      setIsPlayingYearofPlenty(true);
    } else if (cardType === 'Monopoly') {
      setIsPlayingMonopoly(true);
    } else {
      handleAction(`Play ${cardType}`);
    }
  };

  const hasRoadResources = (userData.wood >= 1) && (userData.brick >= 1)
  const hasSettlementResources = (userData.wood >= 1) && (userData.brick >= 1) && (userData.wheat >= 1) && (userData.sheep >= 1)
  const hasCityResources = (userData.wheat >= 2) && (userData.ore >= 3)
  // const hasDevelopmentCardResources = true //dev
  const hasDevelopmentCardResources = (userData.wheat >= 1) && (userData.ore >= 1) && (userData.sheep >= 1)

  const cantAfford = {
    color: 'grey',
    cursor: 'not-allowed',
    opacity: 0.5,
  };
  const resourceCosts = {
    road: "Cost: 1 Wood, 1 Brick",
    settlement: "Cost: 1 Wood, 1 Brick, 1 Wheat, 1 Sheep",
    city: "Cost: 2 Wheat, 3 Ore",
    developmentCard: "Cost: 1 Wheat, 1 Ore, 1 Sheep",
  };

  return (
    <div className="user-panel">
      <div className="development-cards">
        <h4>Development Cards</h4>
        <div>Points: {userData? userData.victoryPoint : 0}</div>
        <div>Knights: {userData? userData.knight: 0} 
            {isMyTurn && userData.knight > 0 && <button onClick={() => playCard('Knight')}>Play</button>}
        </div>
        <div>Road Building: {userData? userData.roadBuilding: 0} 
            {isMyTurn && userData.roadBuilding > 0 && <button onClick={() => playCard('Road Building')}>Play</button>}
        </div>
        <div>Year of Plenty: {userData? userData.yearOfPlenty: 0} 
            {isMyTurn && userData.yearOfPlenty > 0 && <button onClick={() => playCard('Year of Plenty')}>Play</button>}
        </div>
        <div>Monopoly: {userData? userData.monopoly: 0} 
            {isMyTurn && userData.monopoly > 0 && <button onClick={() => playCard('Monopoly')}>Play</button>}
        </div>
      </div>

      <div className="actions">

        {currentMessage &&
          <div className="current-message">{currentMessage}</div>
        }
        {(isBuildingRoad || isBuildingSettlement || isBuildingCity) && 
          <div className="actions-cancel">
            <button onClick={handleCancelBuild}>Cancel</button>
          </div>
        }

        {!currentMessage && isMyTurn && haveRolled && !isPlayingMonopoly && !isPlayingYearofPlenty &&
            <>
            <h4>Actions</h4>
            <div className="actions-grid">
            <button onClick={() => setIsTrading(true)}>Trade</button>
              <div className="hover-container">
                <button 
                  onClick={() => handleAction('Build Road')}
                  style={!hasRoadResources ? cantAfford : {}}
                  disabled={!hasRoadResources}
                >Build Road</button>
                {!hasRoadResources && (
                  <span className="hover-popup">{resourceCosts.road}</span>
                )}
              </div>
              <div className="hover-container">
                <button 
                  onClick={() => handleAction('Build Settlement')}
                  style={!hasSettlementResources ? cantAfford : {}}
                  disabled={!hasSettlementResources}
                >Build Settlement</button>
                {!hasSettlementResources && (
                  <span className="hover-popup">{resourceCosts.settlement}</span>
                )}
              </div>
              <div className="hover-container">
                <button 
                  onClick={() => handleAction('Build City')}
                  style={!hasCityResources ? cantAfford : {}}
                  disabled={!hasCityResources}
                >Build City</button>
                {!hasCityResources && (
                  <span className="hover-popup">{resourceCosts.city}</span>
                )}
              </div>
              <div className="hover-container">
                <button 
                  onClick={() => handleAction('Buy Development Card')}
                  style={!hasDevelopmentCardResources ? cantAfford : {}}
                  disabled={!hasDevelopmentCardResources}
                >Buy Development Card</button>
                {!hasDevelopmentCardResources && (
                  <span className="hover-popup">{resourceCosts.developmentCard}</span>
                )}
              </div>
            </div>
          </>
        }
        
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

      </div>
    </div>
  );
}

export default UserPanel;