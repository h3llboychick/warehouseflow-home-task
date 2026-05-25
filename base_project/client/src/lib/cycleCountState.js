export function summarize(rows) {
  return rows.reduce(
    (totals, row) => {
      if (row.status === "pending_review") {
        totals.openReviewCount += 1;
      }
      totals.totalRows += 1;
      return totals;
    },
    { openReviewCount: 0, totalRows: 0 }
  );
}

export function applyRecountResult(currentRows, updatedRow) {
  const nextRows = currentRows.map((row) => (row.id === updatedRow.id ? updatedRow : row));

  return {
    rows: nextRows,
    totals: summarize(currentRows)
  };
}
