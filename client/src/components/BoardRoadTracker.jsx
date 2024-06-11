function BoardRoadTracker({ longestRoad, hasLongestRoad }) {
    let style
    hasLongestRoad ? style = 'award' : style = 'no-award'  

    return (
      <div className="longest-road">
        <h4>Longest Road</h4>
        <div className={style}>Length: {longestRoad}</div>
      </div>
    );
  }
  
  export default BoardRoadTracker;