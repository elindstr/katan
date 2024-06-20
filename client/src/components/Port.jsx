// Port.jsx
function Port({ x, y, orient, hexSize, value }) {
  let path;
  let justify = 'center'
  let align = 'center'

  if (orient === 2) {
    path = `
      50% 0%,
      100% 25%,
      50% 50%,
      50% 5%
    `;
    justify = 'right'
    align = 'start'
  } else if (orient === 3) {
    path = `
      100% 25%,
      100% 75%,
      50% 50%,
      95% 25%
    `;
    justify = 'right'
  } else if (orient === 4) {
    path = `
      100% 75%,
      50% 100%,
      50% 50%,
      95% 70%
    `;
    justify = 'right'
    align = 'end'
  } else if (orient === 5) {
    path = `
      50% 100%,
      0% 75%,
      50% 50%,
      50% 95%
    `;
    justify = 'left'
    align = 'end'
  } else if (orient === 6) {
    path = `
      0% 75%,
      0% 25%,
      50% 50%,
      5% 75%
    `;
    justify = 'left'
  } else if (orient === 1) {
    path = `
      0% 25%,
      50% 0%,
      50% 50%,
      5% 30%
    `;
    justify = 'left'
    align = 'start'
  }

  const style = {
    transform: `translate(${x}px, ${y}px)`,
    clipPath: `polygon(${path})`,
    width: `${hexSize}px`,
    height: `${hexSize}px`,
    position: 'absolute',
  };

  const textStyle = {
    transform: `translate(${x}px, ${y}px)`,
    width: `${hexSize}px`,
    height: `${hexSize}px`,
    position: 'absolute',
    justifyContent: `${justify}`,
    alignItems: `${align}`,
  };

  return (
    <>
      <div className="port" style={style}></div>
      <div className="port-text" style={textStyle}>{value}</div>
    </>
  );}

export default Port;

