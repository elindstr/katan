// Seats.jsx
function Seats({ numPlayers, seatsObject, handleSitDown }) {

  return (
    <div className="seats">
      {seatsObject.slice(0, numPlayers).map((seat, index) => (
        <button
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
  