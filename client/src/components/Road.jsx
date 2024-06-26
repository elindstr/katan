// Road.jsx

function Road({ id, x, y, orient, hexSize, color, userColor, isBuildingRoad, isBuildingRoadOneOfTwo, isBuildingRoadTwoOfTwo, isInitialRoadPlacement, isLastBuiltSettlement, handleBuildAction, settlements, roads, dev }) {
  let path;
  if (orient === 2) {
    path = `
      50% -3%,
      100% 23%,
      100% 30%,
      50% 5%
    `;
  } else if (orient === 3) {
    path = `
      100% 23%,
      100% 75%,
      94% 75%,
      94% 23%
    `;
  } else if (orient === 4) {
    path = `
      100% 75%,
      47% 100%,
      47% 92%,
      95% 70%
    `;
  } else if (orient === 5) {
    path = `
      50% 100%,
      0% 75%,
      5% 70%,
      50% 93%
    `;
  } else if (orient === 6) {
    path = `
      0% 75%,
      0% 25%,
      6% 25%,
      6% 75%
    `;
  } else if (orient === 1) {
    path = `
      -3% 25%,
      50% -3%,
      50% 5%,
      5% 30%
    `;
  }
  const style = {
    backgroundColor: color,
    position: 'absolute',
    transform: `translate(${x}px, ${y}px)`,
    clipPath: `polygon(${path})`,
    width: `${hexSize}px`,
    height: `${hexSize}px`
  };
  const hoverStyle = {
    backgroundColor: userColor,
    position: 'absolute',
    transform: `translate(${x}px, ${y}px)`,
    clipPath: `polygon(${path})`,
    width: `${hexSize}px`,
    height: `${hexSize}px`
  };

  const handleBuildingRoadOneOfTwo = (type, id) => {
    handleBuildAction('isBuildingRoadOneOfTwo', id)
  }
  const handleBuildingRoadTwoOfTwo = (type, id) => {
    handleBuildAction('isBuildingRoadTwoOfTwo', id)
  }
  const handleBuildingInitialPlacement = (type, id) => {
    handleBuildAction('isInitialRoad', id)
  }

  const canBuildRoad = () => {
    const myAdjacentSettlements = settlements.filter(settlement => 
      settlement.adjacentRoads.includes(id) && settlement.color === userColor
    );
    const myRoads = roads.filter(road => road.color === userColor);
    const myReachableRoads = myRoads.reduce((acc, road) => {
      return acc.concat(road.adjacentRoadsLeft, road.adjacentRoadsRight);
    }, []);
    myAdjacentSettlements.forEach(settlement => {
      myReachableRoads.push(...settlement.adjacentRoads);
    });
    return myReachableRoads.includes(id);
  };
  const canBuildInitialRoad = () => {
    const myReachableRoads = settlements[isLastBuiltSettlement].adjacentRoads;
    return myReachableRoads.includes(id);
  };
  
  // returns
  if (color) {
    return <div className="road" style={style}></div>
  }

  if (isBuildingRoad && canBuildRoad()) {
    return (
          <div 
              className="road hover-display" 
              style={hoverStyle}
              onClick={() => handleBuildAction('road', id)}
          ></div>
  )}
  if (isBuildingRoadOneOfTwo && canBuildRoad()) {
    return (
          <div 
              className="road hover-display" 
              style={hoverStyle}
              onClick={() => handleBuildingRoadOneOfTwo('road', id)}
          ></div>
  )}
  if (isBuildingRoadTwoOfTwo && canBuildRoad()) {
    return (
          <div 
              className="road hover-display" 
              style={hoverStyle}
              onClick={() => handleBuildingRoadTwoOfTwo('road', id)}
          ></div>
  )}
  if (isInitialRoadPlacement && canBuildInitialRoad()) {
    return (
          <div 
              className="road hover-display" 
              style={hoverStyle}
              onClick={() => handleBuildingInitialPlacement('road', id)}
          ></div>
  )}
  

  // Dev
  if (dev) {
    return (
    <div 
      className="road hover-display" 
      style={style}
      onClick={() => console.log('road', id)}>
    </div>
    )
  }

  return (<></>)
}

export default Road;
