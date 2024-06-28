import { useState, useEffect } from 'react';

function TradePanel({ username, userData, handleTradeOffer, setIsTrading, setIsTradingWithBank, currentOffer, handleTradeResponse }) {
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
    let givingSomething = false;
    let receivingSomething = false;

    ['wood', 'brick', 'sheep', 'wheat', 'ore'].forEach(resource => {
      if (offererGiving[resource] > 0) givingSomething = true;
      if (offererReceiving[resource] > 0) receivingSomething = true;
    });

    return givingSomething && receivingSomething;
  };

  useEffect(() => {
    setIsValidTrade(checkValidTrade());
  }, [offererGiving, offererReceiving]);

  const sendOffer = () => {
    if (!isValidTrade) return;
    const offer = {
      offerer: username,
      offererGiving, 
      offererReceiving
    };
    handleTradeOffer(offer);
  };

  const canAcceptOffer = () => {
    return ['wood', 'brick', 'sheep', 'wheat', 'ore'].every(resource => {
      return inventory[resource] + currentOffer.offererGiving[resource] >= currentOffer.offererReceiving[resource];
    });
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

  if (currentOffer) {
    return (
      <div className="trade-panel">
        <h4>Incoming Offer</h4>
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
                    {currentOffer.offererGiving[resource]}
                  </td>
                ))}
              </tr>
              <tr>
                <td>For</td>
                {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
                  <td key={resource}>
                    {currentOffer.offererReceiving[resource]}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Your Total</td>
                {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
                  <td key={resource}>
                    {inventory[resource] + currentOffer.offererGiving[resource] - currentOffer.offererReceiving[resource]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="trade-actions">
            <button 
              onClick={() => handleTradeResponse('accept')} 
              disabled={!canAcceptOffer()}
              style={!canAcceptOffer() ? { color: 'grey' } : null}
            >
              Accept
            </button>
            <button onClick={() => handleTradeResponse('decline')}>Decline</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trade-panel">
      <h4>Trade Offer</h4>
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
                    onClick={() => updateGiving(resource, -1)}
                    disabled={offererGiving[resource] === 0}
                  >
                    -
                  </button>
                  {offererGiving[resource]}
                  <button 
                    onClick={() => updateGiving(resource, 1)}
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
          <button onClick={sendOffer} disabled={!isValidTrade}>Send Offer</button>
          <button onClick={() => setIsTradingWithBank(true)}>Trade With Bank</button>
          <button onClick={() => setIsTrading(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default TradePanel;
