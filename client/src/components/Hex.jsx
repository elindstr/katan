// Hex.jsx
function Hex({ id, x, y, value, hexSize, resource }) {
  
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
      <div className="hex-inner">
        {value}
      </div>
    </div>
  );
}

export default Hex;
