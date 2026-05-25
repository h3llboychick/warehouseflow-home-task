import DataTable from "../components/common/DataTable.jsx";

const GROUPED_COLUMNS = [
  { key: "vendorName", label: "Vendor" },
  { key: "skuCount", label: "Low-stock SKUs" },
  { key: "totalShortage", label: "Total shortage" }
];

const LOW_STOCK_COLUMNS = [
  { key: "code", label: "Bin" },
  { key: "vendorName", label: "Vendor" },
  { key: "sku", label: "SKU" },
  { key: "onHand", label: "On hand" },
  { key: "reorderPoint", label: "Reorder point" },
  { key: "shortage", label: "Shortage" }
];

export default function ReorderPage({
  reorderReport,
  groupedPage,
  hasGroupedRows,
  onPrevGroupedPage,
  onNextGroupedPage,
  lowStockRows,
  lowStockTotal,
  lowStockPage,
  lowStockPageStart,
  lowStockPageEnd,
  lowStockHasNextPage,
  onPrevLowStockPage,
  onNextLowStockPage,
  onRefreshReport,
  onResetDemoState
}) {
  return (
    <section className="content-grid">
      <div className="panel">
        <h2>Reorder Report</h2>
        <p>Purchasing view of low-stock items and vendor-level buying summary.</p>
        <div className="button-row">
          <button onClick={onRefreshReport}>Refresh Report</button>
          <button className="button-secondary" onClick={onResetDemoState}>Restore Operational Data</button>
        </div>
      </div>

      <div className="panel">
        <h3>Vendor Purchase Summary</h3>
        <DataTable
          columns={GROUPED_COLUMNS}
          rows={reorderReport}
          emptyMessage="No vendor summaries are visible on this page."
        />
        <div className="table-pagination">
          <span className="table-pagination__meta">Grouped page {groupedPage}</span>
          <button className="button-secondary" onClick={onPrevGroupedPage} disabled={groupedPage === 1}>
            Previous
          </button>
          <button className="button-secondary" onClick={onNextGroupedPage} disabled={!hasGroupedRows}>
            Next
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>Low-Stock Line Items</h3>
        <DataTable
          columns={LOW_STOCK_COLUMNS}
          rows={lowStockRows}
          emptyMessage="No low-stock line items are visible on this page."
        />
        <div className="table-pagination">
          <span className="table-pagination__meta">
            Showing {lowStockPageStart}-{lowStockPageEnd} of {lowStockTotal} (page {lowStockPage})
          </span>
          <button className="button-secondary" onClick={onPrevLowStockPage} disabled={lowStockPage === 1}>
            Previous
          </button>
          <button className="button-secondary" onClick={onNextLowStockPage} disabled={!lowStockHasNextPage}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
