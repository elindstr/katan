//BoardResourcesTracker.jsx
function BoardResourcesTracker({ inventoryResources }) {
  return (
    <div className="resources-inventory">
      <h4>Resources</h4>
      <div>Wood: {inventoryResources.wood}</div>
      <div>Brick: {inventoryResources.brick}</div>
      <div>Sheep: {inventoryResources.sheep}</div>
      <div>Wheat: {inventoryResources.wheat}</div>
      <div>Ore: {inventoryResources.ore}</div>
    </div>
  );
}

export default BoardResourcesTracker;
