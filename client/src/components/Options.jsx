// Options.jsx
function Options({ handleOptionChange }) {
  return (
    <div className="options">
      <select onChange={(e) => handleOptionChange(e.target.value)}>
        <option value="">Options</option>
        <option value="leaveRoom">Leave</option>
      </select>
    </div>
  );
}

export default Options;

  