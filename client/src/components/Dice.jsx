// Dice.jsx
function Dice({ dice, handleDiceAction, isInitialRoll, haveRolled, displayStartButton, isMyTurn, isHandlingSeven, robberStep, isGameOver }) {

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

        {displayStartButton && 
        <button onClick={() => handleDiceAction('Start Game')}>Start Game</button>}
        
        {isMyTurn && !haveRolled &&
        <button onClick={
          () => handleDiceAction('Roll Dice')
        }>Roll Dice</button>}

        {isInitialRoll && 
        <button onClick={
          () => handleDiceAction('Initial Roll')
        }>Roll Dice</button>}

        {isMyTurn && haveRolled && !isHandlingSeven && !robberStep && !isGameOver &&
        <button onClick={() => handleDiceAction('End Turn')}>End Turn</button>}
        
      </div>
    </div>
  );
}
  
  export default Dice;
  