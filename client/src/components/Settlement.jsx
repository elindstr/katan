// Settlement.jsx
function Settlement({ id, x, y, hexSize, isCity, color, userColor, isBuildingSettlement, isBuildingCity, handleBuildAction, dev }) {
  const size = hexSize * 0.2;
  const settlementStyle = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: userColor,
    transform: `translate(${x - size / 2}px, ${y - size / 2}px)`
  };
  const cityStyle = {
    position: 'absolute',
    width: `${size*1.7}px`,
    height: `${size*1.7}px`,
    backgroundColor: userColor,
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
  
  if (isBuildingCity && color) {
    return (<>
      <div 
        className="settlement" 
        style={ isCity? cityStyle: settlementStyle }
      ></div>
      <div 
        className="settlement hover-display" 
        style={cityStyle}
        onClick={() => handleBuildAction('city', id)}
      ></div>
    </>);
  }

  if (color) {
    return <div className="settlement" style={ isCity? cityStyle: settlementStyle }></div>
  }

  if (isBuildingSettlement) {
    return <div 
              className="settlement hover-display" 
              style={settlementStyle}
              onClick={() => handleBuildAction('settlement', id)}
          ></div>;
  }

  // Dev
  if (dev) {
    return <div 
              className="settlement hover-display" 
              style={settlementStyle}
              onClick={() => console.log('settlement', id)}
          ></div>;
  }

  return (<></>)
}

export default Settlement;
