// Seats.jsx
function Seats({ numPlayers, seats, handleSitDown }) {

  return (
    <div className="seats">

      {seats.slice(0, numPlayers).map((seat, index) => (
        <button
          key={index}
          className="seat"
          onClick={() => handleSitDown(index)}
        >
          {seat ? `${seat}` : 'Empty Seat'}
        </button>
      ))}
    </div>


  );
}
  
export default Seats;
  