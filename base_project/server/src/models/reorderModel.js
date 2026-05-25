function toPositiveNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

export function parseGroupedReportPagination(query) {
  return {
    page: toPositiveNumber(query.page, 1),
    pageSize: toPositiveNumber(query.pageSize, 2)
  };
}

export function parseLowStockPagination(query) {
  return {
    page: toPositiveNumber(query.page, 1),
    pageSize: toPositiveNumber(query.pageSize, 10)
  };
}

