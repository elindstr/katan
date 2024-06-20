import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react';
import Hex from './Hex';
import Road from './Road';
import Settlement from './Settlement';
import Port from './Port';
import BoardResourcesTracker from './BoardResourcesTracker';
import BoardInventoryTracker from './BoardInventoryTracker';
import BoardRoadArmyTracker from './BoardRoadArmyTracker';
import BoardPointsTracker from './BoardPointsTracker';

const Board = React.memo(({
  hexes, ports, roads, settlements, handleBuildAction,
  isBuildingRoad, isBuildingRoadOneOfTwo, isBuildingRoadTwoOfTwo,
  isInitialSettlementPlacement, isInitialRoadPlacement, isLastBuiltSettlement,
  isBuildingSettlement, isBuildingCity, inventoryResources, inventoryMaterials,
  userData, handleRobberHexClick, handleRobberPlayerClick
}) => {
  const [hexSize, setHexSize] = useState(0);
  const [boardStyle, setBoardStyle] = useState({});

  const reSize = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const vw = viewportWidth / 100;
    let boardWidth = 67 * vw;
    let boardHeight = boardWidth * 0.8;
    if (boardHeight > 485) {
      boardHeight = 485;
      boardWidth = boardHeight / 0.80;
    }
    const hexSize = boardWidth / 6;

    setHexSize(hexSize);
    setBoardStyle({
      width: boardWidth,
      height: boardHeight
    });
  }, []);

  useEffect(() => {
    reSize();
    window.addEventListener('resize', reSize);
    return () => window.removeEventListener('resize', reSize);
  }, [reSize]);

  const memoizedHexes = useMemo(() => hexes.map(hex => (
    <Hex
      key={hex.id}
      hex={hex}
      hexSize={hexSize}
      settlements={settlements}
      handleRobberHexClick={handleRobberHexClick}
    />
  )), [hexes, hexSize, handleRobberHexClick, settlements]);

  const memoizedPorts = useMemo(() => ports.map(port => (
    !port.value ? null : <Port key={port.id} x={port.x * hexSize} y={port.y * hexSize} value={port.value} hexSize={hexSize} orient={port.orient} />
  )), [ports, hexSize]);

  const memoizedRoads = useMemo(() => roads.map(road => (
    <Road
      key={road.id}
      id={road.id}
      x={road.x * hexSize}
      y={road.y * hexSize}
      orient={road.orient}
      hexSize={hexSize}
      color={road.color}
      isBuildingRoad={isBuildingRoad}
      isBuildingRoadOneOfTwo={isBuildingRoadOneOfTwo}
      isBuildingRoadTwoOfTwo={isBuildingRoadTwoOfTwo}
      isInitialRoadPlacement={isInitialRoadPlacement}
      isLastBuiltSettlement={isLastBuiltSettlement}
      handleBuildAction={handleBuildAction}
      userColor={userData ? userData.color : 'black'}
      dev={false}
      settlements={settlements}
      roads={roads}
    />
  )), [roads, hexSize, isBuildingRoad, isBuildingRoadOneOfTwo, isBuildingRoadTwoOfTwo, isInitialRoadPlacement, isLastBuiltSettlement, handleBuildAction, userData, settlements]);

  const memoizedSettlements = useMemo(() => settlements.map(settlement => (
    <Settlement
      key={settlement.id}
      id={settlement.id}
      x={settlement.x * hexSize}
      y={settlement.y * hexSize}
      hexSize={hexSize}
      isCity={settlement.isCity}
      color={settlement.color}
      username={settlement.username}
      isBuildingSettlement={isBuildingSettlement}
      isBuildingCity={isBuildingCity}
      isInitialSettlementPlacement={isInitialSettlementPlacement}
      handleBuildAction={handleBuildAction}
      userColor={userData ? userData.color : 'black'}
      dev={false}
      handleRobberPlayerClick={handleRobberPlayerClick}
      settlements={settlements}
    />
  )), [settlements, hexSize, isBuildingSettlement, isBuildingCity, isInitialSettlementPlacement, handleBuildAction, userData, handleRobberPlayerClick]);

  if (!hexes || !ports || !roads || !settlements) return (<div>loading...</div>);

  return (
    <div className="board-container">
      <BoardResourcesTracker inventoryResources={inventoryResources} />
      <BoardInventoryTracker inventoryMaterials={inventoryMaterials} />

      <BoardRoadArmyTracker
        armySize={userData ? userData.knightCount : 0}
        hasLargestArmy={userData ? userData.largestArmy : false}
        longestRoad={userData ? userData.roadLength : 0}
        hasLongestRoad={userData ? userData.longestRoad : false}
      />

      <BoardPointsTracker
        points={userData ? userData.points : 0}
      />

      <div className="board" style={boardStyle}>
        {memoizedPorts}
        {memoizedHexes}
        {memoizedRoads}
        {memoizedSettlements}
      </div>
    </div>
  );
});

Board.displayName = 'Board';

export default Board;
