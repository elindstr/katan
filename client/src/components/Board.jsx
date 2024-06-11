import { useState, useEffect } from 'react';
import Hex from './Hex';
import Road from './Road';
import Settlement from './Settlement';
import Port from './Port';
import InventoryResources from './InventoryResources';
import InventoryMaterials from './InventoryMaterials';
import BoardRoadTracker from './BoardRoadTracker';
import BoardArmyTracker from './BoardArmyTracker';


function Board({hexes, ports, roads, settlements, handleBuildAction, isBuildingRoad, isBuildingSettlement, isBuildingCity, userColor, inventoryResources, inventoryMaterials, userData}) {
  const [hexSize, setHexSize] = useState(0);
  const [boardStyle, setBoardStyle] = useState({});

  // calculate board width & hex size
  const reSize = () => {
    const viewportWidth = window.innerWidth;
    const vw = viewportWidth / 100;
    let boardWidth = 67 * vw;
    let boardHeight = boardWidth * 0.8;
    if (boardHeight > 485) {
      boardHeight = 485;
      boardWidth = boardHeight / 0.8;
    }
    const hexSize = boardWidth / 6;

    setHexSize(hexSize);
    setBoardStyle({
      width: boardWidth,
      height: boardHeight
    });
  };

  // Set initial size and add resize event listener
  useEffect(() => {
    reSize();
    window.addEventListener('resize', reSize);
    return () => window.removeEventListener('resize', reSize);
  }, []);

  // loading
  if (!hexes || !ports || !roads || !settlements) return (<div>loading...</div>)

  // main return
  return (
    <div className="board-container ">
      <InventoryResources inventoryResources={inventoryResources} />
      <InventoryMaterials inventoryMaterials={inventoryMaterials} />
      <BoardRoadTracker longestRoad={userData? userData.roadLength: 0} hasLongestRoad={userData? userData.points.longestRoad: false} />
      <BoardArmyTracker armySize={userData? userData.knightCount: 0} hasLargestArmy={userData? userData.points.largestArmy: false}  />

      <div className="board" style={boardStyle}>
        {ports.map(port => (
          !port.value? null:
            <Port key={port.id} x={port.x * hexSize} y={port.y * hexSize} value={port.value} hexSize={hexSize} orient={port.orient} />
        ))}
        {hexes.map(hex => (
          <Hex key={hex.id} id={hex.id} x={hex.x * hexSize} y={hex.y * hexSize} value={hex.value} hexSize={hexSize} resource={hex.resource} dev={false} />
        ))}
        {roads.map(road => (
          <Road 
            key={road.id} 
            id={road.id} 
            x={road.x * hexSize} 
            y={road.y * hexSize} 
            orient={road.orient} 
            hexSize={hexSize} 
            color={road.color} 
            isBuildingRoad={isBuildingRoad}
            handleBuildAction={handleBuildAction}
            userColor={userColor}
            dev={false}
          />
        ))}

        {settlements.map(settlement => (
          <Settlement 
            key={settlement.id}
            id={settlement.id} 
            x={settlement.x * hexSize} 
            y={settlement.y * hexSize} 
            hexSize={hexSize}
            isCity={settlement.isCity}
            color={settlement.color} 
            isBuildingSettlement={isBuildingSettlement}
            isBuildingCity={isBuildingCity}
            handleBuildAction={handleBuildAction}
            userColor={userColor}
            dev={false}
          />
        ))}

      </div>
    </div>
  );
}

export default Board;
