import MetricCard from "../components/common/MetricCard.jsx";

export default function OverviewPage({
  shipmentsCount,
  allShipmentsCount,
  openReviewCount,
  lowStockCount,
  activePage
}) {
  return (
    <section className="content-grid">
      <div className="panel panel--hero">
        <h2>Operations Overview</h2>
        <p>Live warehouse dashboard for inventory, shipments, cycle counts, and purchasing readiness.</p>
        <div className="metric-grid">
          <MetricCard label="Visible shipments today" value={shipmentsCount} />
          <MetricCard label="All configured shipments" value={allShipmentsCount} />
          <MetricCard label="Open discrepancy reviews" value={openReviewCount} />
          <MetricCard label="Low-stock SKUs shown" value={lowStockCount} />
          <MetricCard label="Active page" value={activePage.replace("-", " ")} />
        </div>
      </div>

      <div className="panel">
        <h3>Navigation</h3>
        <p>Use the sidebar to move between inventory, shipments, allocation, cycle count review, and reorder workflows.</p>
      </div>
    </section>
  );
}
