import DataTable from "../components/common/DataTable.jsx";

const INVENTORY_COLUMNS = [
  { key: "code", label: "Bin" },
  { key: "aisle", label: "Aisle" },
  { key: "sku", label: "SKU" },
  { key: "on_hand_quantity", label: "On hand" },
  { key: "reserved_quantity", label: "Reserved" },
  { key: "vendor_name", label: "Vendor" }
];

export default function InventoryPage({
  inventorySku,
  inventoryAisle,
  onInventorySkuChange,
  onInventoryAisleChange,
  onSearchInventory,
  onClearFilters,
  onResetDemoState,
  inventory
}) {
  return (
    <section className="content-grid">
      <div className="panel">
        <h2>Inventory Search</h2>
        <p>All inventory is visible by default. Narrow the list using SKU and aisle filters.</p>
        <div className="form-grid">
          <label>
            SKU
            <input value={inventorySku} onChange={(event) => onInventorySkuChange(event.target.value)} />
          </label>
          <label>
            Aisle
            <input value={inventoryAisle} onChange={(event) => onInventoryAisleChange(event.target.value)} />
          </label>
        </div>
        <div className="button-row">
          <button onClick={onSearchInventory}>Search Inventory</button>
          <button className="button-secondary" onClick={onClearFilters}>Clear Filters</button>
          <button className="button-secondary" onClick={onResetDemoState}>Restore Operational Data</button>
        </div>
      </div>

      <div className="panel">
        <h3>Inventory Results</h3>
        <DataTable
          columns={INVENTORY_COLUMNS}
          rows={inventory}
          emptyMessage="No inventory rows match the current filters."
        />
      </div>
    </section>
  );
}
