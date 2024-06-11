function BoardArmyTracker({ armySize, hasLargestArmy }) {
    let style
    hasLargestArmy ? style = 'award' : style = 'no-award' 

    return (
      <div className="largest-army">
        <h4>Army</h4>
        <div className={style}>Size: {armySize}</div>
      </div>
    );
  }
  
  export default BoardArmyTracker;