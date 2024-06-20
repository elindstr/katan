import React from 'react';

function Hex({ hex, hexSize, settlements, handleRobberHexClick }) {
  const { id, x, y, value, resource, hasRobber, adjacentNodes } = hex;

  let color;
  switch (resource) {
    case 'wood':
      color = 'darkolivegreen';
      break;
    case 'brick':
      color = 'firebrick';
      break;
    case 'sheep':
      color = 'limegreen';
      break;
    case 'wheat':
      color = 'gold';
      break;
    case 'ore':
      color = 'dimgray';
      break;
    case 'desert':
      color = 'wheat';
      break;
    default:
      color = 'gray';
  }

  const style = {
    transform: `translate(${x * hexSize}px, ${y * hexSize}px)`,
    position: 'absolute',
    width: `${hexSize}px`,
    height: `${hexSize}px`,
    backgroundColor: color,
    clipPath: `polygon(
      49% 1%,
      99% 26%,
      99% 74%,
      49% 99%,
      1% 74%,
      1% 26%
    )`
  };

  const handleClick = () => {
    let isEligible = false;
    adjacentNodes.forEach(nodeId => {
      const settlement = settlements.find(settlement => settlement.id === nodeId);
      if (settlement && settlement.color) {
        isEligible = true;
      }
    });

    if (isEligible) {
      handleRobberHexClick(id);
    }
  };

  return (
    <div className="hex" style={style}>
      <div className="hex-inner" onClick={handleClick}>
        {value} {hasRobber && <span className="robber">&#9823;</span>}
      </div>
    </div>
  );
}

export default Hex;
