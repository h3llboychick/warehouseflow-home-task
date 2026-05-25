import DataTable from "../components/common/DataTable.jsx";

const REQUEST_COLUMNS = [
  { key: "shipment_number", label: "Shipment", render: () => "SHIP-1001" },
  { key: "sku", label: "Line SKU", render: () => "SKU-100" },
  { key: "requested_quantity", label: "Requested quantity", render: () => 4 },
  { key: "allocated_quantity", label: "Allocated before run", render: () => 0 }
];

const STOCK_COLUMNS = [
  { key: "code", label: "Bin" },
  { key: "on_hand_quantity", label: "On hand" },
  { key: "reserved_quantity", label: "Already reserved" },
  { key: "free_to_allocate", label: "Free to allocate" }
];

const RESULT_COLUMNS = [
  { key: "lineId", label: "Line ID" },
  { key: "binCode", label: "Bin" },
  { key: "allocated", label: "Allocated quantity" }
];

export default function AllocationPage({
  onRefreshAllocationInventory,
  onRunAllocation,
  onResetDemoState,
  allocationRows,
  allocationResult
}) {
  return (
    <section className="content-grid">
      <div className="panel">
        <h2>Shipment Allocation</h2>
        <p>Allocate outbound shipment lines against available inventory bins.</p>
        <DataTable
          columns={REQUEST_COLUMNS}
          rows={[{ id: 1 }]}
        />
        <div className="button-row">
          <button onClick={onRefreshAllocationInventory}>Refresh SKU-100 stock</button>
          <button onClick={onRunAllocation}>Allocate SHIP-1001</button>
          <button className="button-secondary" onClick={onResetDemoState}>Restore Operational Data</button>
        </div>
      </div>

      <div className="panel">
        <h3>SKU-100 Stock Snapshot</h3>
        <DataTable
          columns={STOCK_COLUMNS}
          rows={allocationRows}
        />
      </div>

      <div className="panel">
        <h3>Latest Allocation Result</h3>
        <DataTable
          columns={RESULT_COLUMNS}
          rows={allocationResult}
          emptyMessage="Run allocation to see which bins the system chooses."
        />
      </div>
    </section>
  );
}
