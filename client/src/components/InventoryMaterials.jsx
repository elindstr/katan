//InventoryMaterials.jsx

function InventoryMaterials({ inventoryMaterials }) {
  return (
    <div className="inventory-summary">
      <h4>Inventory</h4>
      <div>Roads: {inventoryMaterials.roads}</div>
      <div>Settlements: {inventoryMaterials.settlements}</div>
      <div>Cities: {inventoryMaterials.cities}</div>
    </div>
  );
}

export default InventoryMaterials;
