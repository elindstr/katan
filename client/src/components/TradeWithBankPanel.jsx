import { useState, useEffect } from 'react';

function TradeWithBankPanel({ userData, bankTrade, setIsTrading, setIsTradingWithBank }) {
  const [offererGiving, setOffererGiving] = useState({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });
  const [offererReceiving, setOffererReceiving] = useState({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });
  const [isValidTrade, setIsValidTrade] = useState(false);

  const updateGiving = (resource, amount) => {
    setOffererGiving(prev => {
      const newValue = prev[resource] + amount;
      if (newValue >= 0 && newValue <= userData[resource]) {
        return {
          ...prev,
          [resource]: newValue,
        };
      }
      return prev;
    });
  };

  const updateReceiving = (resource, amount) => {
    setOffererReceiving(prev => {
      const newValue = prev[resource] + amount;
      if (newValue >= 0) {
        return {
          ...prev,
          [resource]: newValue,
        };
      }
      return prev;
    });
  };

  const checkValidTrade = () => {
    const givingTotal = Object.values(offererGiving).reduce((total, amount) => total + amount, 0);
    const receivingTotal = Object.values(offererReceiving).reduce((total, amount) => total + amount, 0);
    return givingTotal >= 4 && givingTotal % 4 === 0 && receivingTotal === givingTotal / 4;
  };

  useEffect(() => {
    setIsValidTrade(checkValidTrade());
  }, [offererGiving, offererReceiving]);

  const sendOffer = () => {
    const offer = {
      offerer: userData.username,
      offererGiving, 
      offererReceiving
    }
    bankTrade(offer);
  };

  if (!userData) {
    return null;
  }

  const inventory = userData || {
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
    knight: 0,
    victoryPoint: 0,
    roadBuilding: 0,
    yearOfPlenty: 0,
    monopoly: 0,
  };

  return (
    <div className="trade-panel">
      <h4>Bank Trade</h4>
      <div className="trade-panel-container">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
                <th key={resource}>{resource.charAt(0).toUpperCase() + resource.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Offering</td>
              {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
                <td key={resource}>
                  <button 
                    onClick={() => updateGiving(resource, inventory[resource] >= 4 ? -4 : -1)}
                    disabled={offererGiving[resource] === 0}
                  >
                    -
                  </button>
                  {offererGiving[resource]}
                  <button 
                    onClick={() => updateGiving(resource, inventory[resource] >= 4 ? 4 : 1)}
                    disabled={offererGiving[resource] >= inventory[resource]}
                  >
                    +
                  </button>
                </td>
              ))}
            </tr>
            <tr>
              <td>For</td>
              {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
                <td key={resource}>
                  <button 
                    onClick={() => updateReceiving(resource, -1)}
                    disabled={offererReceiving[resource] === 0}
                  >
                    -
                  </button>
                  {offererReceiving[resource]}
                  <button 
                    onClick={() => updateReceiving(resource, 1)}
                  >
                    +
                  </button>
                </td>
              ))}
            </tr>
            <tr>
              <td>Your Total</td>
              {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
                <td key={resource}>
                  {inventory[resource] - offererGiving[resource] + offererReceiving[resource]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className="trade-actions">
          <button onClick={sendOffer} disabled={!isValidTrade}>Execute Trade</button>
          <button onClick={() => setIsTradingWithBank(false)}>Trade With Settlers</button>
          <button onClick={() => setIsTrading(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default TradeWithBankPanel;
