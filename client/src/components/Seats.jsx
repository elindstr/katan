// Seats.jsx
function Seats({ numPlayers, seatsObject, handleSitDown, currentTurn }) {
  const currentTurnStyle = {
    border: "2px solid red"
  }

  return (
    <div className="seats">
      {seatsObject.slice(0, numPlayers).map((seat, index) => (
        <button
          style={(currentTurn == index)? currentTurnStyle: null}
          key={index}
          className="seat"
          onClick={() => handleSitDown(index)}
        >
          {seat.username ? `${seat.username}` : 'Empty Seat'}
        </button>
      ))}
    </div>
  );
}

export default Seats;
  