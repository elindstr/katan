// Road.jsx

//todo: regulate road building as connected to road except on initial build

function Road({ id, x, y, orient, hexSize, color, userColor, isBuildingRoad, isBuildingRoadTwice, handleBuildAction, dev }) {
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
    backgroundColor: userColor,
    position: 'absolute',
    transform: `translate(${x}px, ${y}px)`,
    clipPath: `polygon(${path})`,
    width: `${hexSize}px`,
    height: `${hexSize}px`
  };


  const handleBuildingRoadTwice = (type, id) => {
    handleBuildAction('isBuildingRoadTwice', id)
  }

  if (color) {
    return <div className="road" style={style}></div>
  }
  if (isBuildingRoad) {
    return (
          <div 
              className="road hover-display" 
              style={style}
              onClick={() => handleBuildAction('road', id)}
          ></div>
  )}
  if (isBuildingRoadTwice) {
    return (
          <div 
              className="road hover-display" 
              style={style}
              onClick={() => handleBuildingRoadTwice('road', id)}
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
