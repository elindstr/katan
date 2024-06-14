// TradePanel.jsx
import { useState } from 'react';

function TradePanel({ userData, handleTradeOffer, setIsTrading, currentOffer, handleTradeResponse }) {

  // create offer 
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
  const updateGiving = (resource, amount) => {
    setOffererGiving(prev => ({
      ...prev,
      [resource]: prev[resource] + amount,
    }));
  };
  const updateReceiving = (resource, amount) => {
    setOffererReceiving(prev => ({
      ...prev,
      [resource]: prev[resource] + amount,
    }));
  };
  const sendOffer = () => {
    const offer = {
      offerer: userData.username,
      offererGiving, 
      offererReceiving
    }
    handleTradeOffer(offer);
  };

  // accepting offer
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
                {/* <button onClick={() => updateGiving(resource, -1)}>-</button> */}
                {currentOffer.offererGiving[resource]}
                {/* <button onClick={() => updateGiving(resource, 1)}>+</button> */}
              </td>
            ))}
          </tr>
          <tr>
            <td>For</td>
            {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
              <td key={resource}>
                {/* <button onClick={() => updateReceiving(resource, -1)}>-</button> */}
                {currentOffer.offererReceiving[resource]}
                {/* <button onClick={() => updateReceiving(resource, 1)}>+</button> */}
              </td>
            ))}
          </tr>
          <tr>
            <td>Your Total</td>
            {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
              <td key={resource}>
                {userData[resource] + currentOffer.offererGiving[resource] - currentOffer.offererReceiving[resource]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="trade-actions">
        <button onClick={() => handleTradeResponse('accept')}>Accept</button>
        <button onClick={() => handleTradeResponse('decline')}>Decline</button>
      </div>

      </div>
    </div>

    )
  }

  // creating offer
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
                <button onClick={() => updateGiving(resource, -1)}>-</button>
                {offererGiving[resource]}
                <button onClick={() => updateGiving(resource, 1)}>+</button>
              </td>
            ))}
          </tr>
          <tr>
            <td>For</td>
            {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
              <td key={resource}>
                <button onClick={() => updateReceiving(resource, -1)}>-</button>
                {offererReceiving[resource]}
                <button onClick={() => updateReceiving(resource, 1)}>+</button>
              </td>
            ))}
          </tr>
          <tr>
            <td>Your Total</td>
            {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(resource => (
              <td key={resource}>
                {userData[resource] - offererGiving[resource] + offererReceiving[resource]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="trade-actions">
        <button onClick={sendOffer}>Send Offer</button>
        <button onClick={() => setIsTrading(false)}>Cancel</button>
      </div>

      </div>
    </div>
  );
}

export default TradePanel;

