// Settlement.jsx

//todo: regulate settlement building within 1 node away; and must be connected to road except on initial build 

function Settlement({ id, x, y, hexSize, isCity, username, color, userColor, isBuildingSettlement, isBuildingCity, isInitialSettlementPlacement, handleBuildAction, dev, handleRobberPlayerClick, settlements }) {
  
  const size = hexSize * 0.2;
  const settlementStyle = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    transform: `translate(${x - size / 2}px, ${y - size / 2}px)`
  };
  const settlementHoverStyle = {
    ...settlementStyle,
    backgroundColor: userColor
  };
  const cityStyle = {
    position: 'absolute',
    width: `${size*1.7}px`,
    height: `${size*1.7}px`,
    backgroundColor: color || userColor,
    transform: `translate(${x - size / 2}px, ${(y - size / 2)-10}px)`,
    clipPath: `polygon(
      0% 0%,
      50% 0%,
      50% 40%,
      100% 40%,
      100% 100%,
      0% 100%,
      0% 0%
    )`,
  };
  const CityHoverStyle = {
    ...cityStyle,
    backgroundColor: userColor
  };
  
  const handleInitialPlacement = (type, id) => {
    handleBuildAction('isInitialSettlement', id)
  }

  const isTwoNodesAway = () => {
    //check that settlement[id] does not share an .adjacentRoads with any previously built settlement
    const currentAdjacentRoads = settlements[id].adjacentRoads;
    let isTwoNodesAway = true;
    settlements.forEach(settlement => {
      if (settlement.username) {
        settlement.adjacentRoads.forEach(road => {
          if (currentAdjacentRoads.includes(road)) {
            isTwoNodesAway = false;
          }
        });
      }
    });
    return isTwoNodesAway;
  };


  if (isBuildingCity && color) {
    return (<>
      <div 
        className="settlement" 
        style={ isCity? cityStyle: settlementStyle }
      ></div>
      <div 
        className="settlement hover-display" 
        style={CityHoverStyle}
        onClick={() => handleBuildAction('city', id)}
      ></div>
    </>);
  }

  if (color) {
    return <div className="settlement" style={ isCity? cityStyle: settlementStyle } onClick={() => handleRobberPlayerClick(username, id)}></div>
  }

  if (isBuildingSettlement && isTwoNodesAway()) {
    return <div 
              className="settlement hover-display" 
              style={settlementHoverStyle}
              onClick={() => handleBuildAction('settlement', id)}
          ></div>;
  }
  if (isInitialSettlementPlacement && isTwoNodesAway()) {
    return <div 
              className="settlement hover-display" 
              style={settlementHoverStyle}
              onClick={() => handleInitialPlacement('settlement', id)}
          ></div>;
  }

  
  // Dev
  if (dev) {
    return <div 
              className="settlement hover-display" 
              style={settlementStyle}
              onClick={() => console.log('settlement', id, username)}
          ></div>;
  }

  return (<></>)
}

export default Settlement;
