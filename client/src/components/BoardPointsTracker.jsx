function BoardPointsTracker({ points }) {
    return (
      <div className="points-tracker">
        <h4>Victory Points: <span>{points}</span></h4>
      </div>
    );
  }
  
  export default BoardPointsTracker;