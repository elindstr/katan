// Dice.jsx
function Dice({ dice, handleDiceAction }) {

    return (
      <div className="dice-container">
        <div className="dice">
            {dice.length === 2 ? (
            <>
                <img src={dice[0]?.src || ''} alt={dice[0]?.alt} width='50px' />
                <img src={dice[1]?.src || ''} alt={dice[1]?.alt} width='50px' />
            </>
            ) : (
            <p>Loading...</p>
            )}
        </div>

        <div className="control-button">
          <button onClick={() => handleDiceAction('Start Game')}>Start Game</button>
          <button onClick={() => handleDiceAction('Roll Dice')}>Roll Dice</button>
          <button onClick={() => handleDiceAction('End Turn')}>End Turn</button>
          
        </div>
      </div>
    );
  }
  
  export default Dice;
  