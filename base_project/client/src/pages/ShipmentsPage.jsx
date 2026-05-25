import DataTable from "../components/common/DataTable.jsx";

const columns = [
  { key: "shipment_number", label: "Shipment" },
  { key: "warehouse_local_timezone", label: "Warehouse local timezone" },
  { key: "status", label: "Status" },
  { key: "scheduled_at_utc", label: "Scheduled at (UTC)" }
];

export default function ShipmentsPage({
  shipmentDate,
  onRefreshShipments,
  onResetDemoState,
  allShipments,
  shipments
}) {
  return (
    <section className="content-grid">
      <div className="panel">
        <h2>Shipment Dashboard</h2>
        <p>Compare all known shipments with the shipments visible for the current Europe/Tallinn warehouse day.</p>
        <div className="button-row">
          <button onClick={onRefreshShipments}>Refresh Dashboard</button>
          <button className="button-secondary" onClick={onResetDemoState}>Restore Operational Data</button>
        </div>
      </div>

      <div className="panel">
        <h3>All Shipments</h3>
        <DataTable columns={columns} rows={allShipments} emptyMessage="No shipments are configured." />
      </div>

      <div className="panel">
        <h3>Today&apos;s Visible Shipments ({shipmentDate} / Europe/Tallinn)</h3>
        <DataTable columns={columns} rows={shipments} emptyMessage="No shipments are visible for the selected local date." />
      </div>
    </section>
  );
}
