// DiscardPanel.jsx
import { useState, useEffect } from 'react';

function DiscardPanel({ isHandlingSeven, userData, handleDiscard }) {
  const requiredDiscardAmount = isHandlingSeven;
  const [giving, setGiving] = useState({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });
  const [totalGiving, setTotalGiving] = useState(0);

  useEffect(() => {
    const total = Object.values(giving).reduce((sum, amount) => sum + amount, 0);
    setTotalGiving(total);
  }, [giving]);

  const updateGiving = (resource, amount) => {
    setGiving(prev => {
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

  const inventory = userData || {
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  };

  return (
    <div className="trade-panel">
      <h4>Discard {requiredDiscardAmount} cards</h4>
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
                    disabled={giving[resource] === 0}
                  >
                    -
                  </button>
                  {giving[resource]}
                  <button 
                    onClick={() => updateGiving(resource, 1)}
                    disabled={
                      (giving[resource] >= inventory[resource]) ||
                      (totalGiving === requiredDiscardAmount)
                    }
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
                  {inventory[resource] - giving[resource]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div className="trade-actions">
          <button 
            onClick={() => handleDiscard(giving)}
            disabled={totalGiving !== requiredDiscardAmount}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiscardPanel;

