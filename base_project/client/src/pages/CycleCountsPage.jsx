import { useMemo } from "react";
import DataTable from "../components/common/DataTable.jsx";
import MetricCard from "../components/common/MetricCard.jsx";

const COUNT_COLUMNS = [
  { key: "bin_code", label: "Bin" },
  { key: "expected_quantity", label: "Expected" },
  { key: "counted_quantity", label: "Counted" },
  { key: "status", label: "Status" },
  { key: "counted_at", label: "Counted at" }
];

export default function CycleCountsPage({ cycleState, onApplyRecount, onResetDemoState }) {
  const recountCandidate = useMemo(
    () => cycleState.rows.find((row) => row.bin_code === "A-01-02"),
    [cycleState.rows]
  );

  const { openReviewRows, resolvedRows } = useMemo(() => {
    const openRows = [];
    const closedRows = [];

    for (const row of cycleState.rows) {
      if (row.status === "pending_review") {
        openRows.push(row);
      } else {
        closedRows.push(row);
      }
    }

    return { openReviewRows: openRows, resolvedRows: closedRows };
  }, [cycleState.rows]);

  return (
    <section className="content-grid">
      <div className="panel">
        <h2>Cycle Count Review</h2>
        <p>
          A recount is a second physical verification of stock in a bin after the first count does not match the expected quantity in the system.
          Warehouse teams use this review step before approving an inventory adjustment.
        </p>
        <div className="metric-grid metric-grid--compact">
          <MetricCard label="Count rows" value={cycleState.totals.totalRows} />
          <MetricCard label="Open discrepancy reviews" value={cycleState.totals.openReviewCount} tone="alert" />
        </div>
        <div className="review-card">
          <h3>Discrepancy Under Review</h3>
          {recountCandidate ? (
            <>
              <p>
                Bin <strong>{recountCandidate.bin_code}</strong> was first counted as <strong>{recountCandidate.counted_quantity}</strong>
                {" "}against an expected quantity of <strong>{recountCandidate.expected_quantity}</strong>.
              </p>
              <p>Supervisor approval finalizes the recount result for this bin.</p>
            </>
          ) : (
            <p>No discrepancy row is currently loaded.</p>
          )}
        </div>
        <div className="button-row">
          <button onClick={onApplyRecount}>Approve Review For A-01-02</button>
          <button className="button-secondary" onClick={onResetDemoState}>Restore Operational Data</button>
        </div>
      </div>

      <div className="panel">
        <h3>Open Discrepancy Review Queue</h3>
        <DataTable
          columns={COUNT_COLUMNS}
          rows={openReviewRows}
          emptyMessage="No open discrepancy reviews remain."
        />
      </div>

      <div className="panel">
        <h3>Recently Approved Reviews</h3>
        <DataTable
          columns={COUNT_COLUMNS}
          rows={resolvedRows}
          emptyMessage="No reviewed rows have been approved yet."
        />
      </div>
    </section>
  );
}
