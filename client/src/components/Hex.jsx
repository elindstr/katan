// Hex.jsx
function Hex({ hex, hexSize, dev, handleRobberHexClick }) {
  
  const id = hex.id 
  const x = hex.x * hexSize
  const y = hex.y * hexSize
  const value = hex.value
  const resource = hex.resource
  const hasRobber = hex.hasRobber

  let color
  if (resource == "wood") color = "darkolivegreen"
  if (resource == "brick") color = "firebrick"
  if (resource == "sheep") color = "limegreen"
  if (resource == "wheat") color = "gold"
  if (resource == "ore") color = "dimgray"
  if (resource == "desert") color = "wheat"

  const style = {
    transform: `translate(${x}px, ${y}px)`,
    position: 'absolute',
    width: `${hexSize}px`,
    height: `${hexSize}px`,
    border: '',
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

  return (
    <div className="hex" style={style}>
      <div className="hex-inner" onClick={() => handleRobberHexClick(hex.id)}>
        {value} {hasRobber? <span className="robber">&#9823;</span>: null}
      </div>
    </div>
  );
}

export default Hex;
