//UserPanel.jsx
//todo: add cancel button for building states

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
  const [inventory, setInventory] = useState(null);
  const [resourceChecks, setResourceChecks] = useState({
    hasRoadResources: false,
    hasSettlementResources: false,
    hasCityResources: false,
    hasDevelopmentCardResources: false,
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

  useEffect(() => {
    const setData = async (userData) => { 
      console.log(userData)
      await setInventory(userData.inventory);
      await setResourceChecks({
        hasRoadResources: (inventory.wood >= 1) && (inventory.brick >= 1),
        hasSettlementResources: (inventory.wood >= 1) && (inventory.brick >= 1) && (inventory.wheat >= 1) && (inventory.sheep >= 1),
        hasCityResources: (inventory.wheat >= 2) && (inventory.ore >= 3),
        hasDevelopmentCardResources: (inventory.wheat >= 1) && (inventory.ore >= 1) && (inventory.sheep >= 1),
      });
    }

    if (userData) {
      setData(userData)
    }

  }, [userData]);

  if (!inventory) {
    console.log('No user data');
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
        <div>Points: {inventory.victoryPoint}</div>
        <div>Knights: {inventory.knight} 
            {inventory.knight > 0 && <button onClick={() => playCard('Knight')}>Play</button>}</div>
        <div>Road Building: {inventory.roadBuilding} 
            {inventory.roadBuilding > 0 && <button onClick={() => playCard('Road Building')}>Play</button>}</div>
        <div>Year of Plenty: {inventory.yearOfPlenty} 
            {inventory.yearOfPlenty > 0 && <button onClick={() => playCard('Year of Plenty')}>Play</button>}</div>
        <div>Monopoly: {inventory.monopoly} 
            {inventory.monopoly > 0 && <button onClick={() => playCard('Monopoly')}>Play</button>}</div>
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
                <div className="hover-container">
                  <button 
                    onClick={() => handleAction('Build Road')}
                    style={!resourceChecks.hasRoadResources ? cantAfford : {}}
                    disabled={!resourceChecks.hasRoadResources}
                  >Build Road</button>
                  {!resourceChecks.hasRoadResources && (
                    <span className="hover-popup">{resourceCosts.road}</span>
                  )}
                </div>
                <div className="hover-container">
                  <button 
                    onClick={() => handleAction('Build Settlement')}
                    style={!resourceChecks.hasSettlementResources ? cantAfford : {}}
                    disabled={!resourceChecks.hasSettlementResources}
                  >Build Settlement</button>
                  {!resourceChecks.hasSettlementResources && (
                    <span className="hover-popup">{resourceCosts.settlement}</span>
                  )}
                </div>
                <div className="hover-container">
                  <button 
                    onClick={() => handleAction('Build City')}
                    style={!resourceChecks.hasCityResources ? cantAfford : {}}
                    disabled={!resourceChecks.hasCityResources}
                  >Build City</button>
                  {!resourceChecks.hasCityResources && (
                    <span className="hover-popup">{resourceCosts.city}</span>
                  )}
                </div>
                <div className="hover-container">
                  <button 
                    onClick={() => handleAction('Buy Development Card')}
                    style={!resourceChecks.hasDevelopmentCardResources ? cantAfford : {}}
                    disabled={!resourceChecks.hasDevelopmentCardResources}
                  >Buy Development Card</button>
                  {!resourceChecks.hasDevelopmentCardResources && (
                    <span className="hover-popup">{resourceCosts.developmentCard}</span>
                  )}
                </div>
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
