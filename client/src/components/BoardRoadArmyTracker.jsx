function BoardRoadArmyTracker({ armySize, hasLargestArmy, longestRoad, hasLongestRoad }) {
    return (
      <div className="army-road-tracker">
        <h4 className={hasLongestRoad? 'award': 'no-award'}>Longest Road: <span>{longestRoad}</span></h4>
        <h4 className={hasLargestArmy? 'award': 'no-award'}>Army: <span>{armySize}</span></h4>
      </div>
    );
  }
  
  export default BoardRoadArmyTracker;