function addPaginationOffset(page, pageSize) {
  return {
    page: Math.max(1, page),
    pageSize: Math.max(1, pageSize)
  };
}

export function createReorderService({ pool, reorderRepository, reorderEntity }) {
  return {
    async getGroupedVendorSummary(page, pageSize) {
      const pagination = addPaginationOffset(page, pageSize);
      const rows = await reorderRepository.findGroupedVendorSummaryFromLimitedRows(pool, pagination.page, pagination.pageSize);
      return rows.map(reorderEntity.toVendorSummary);
    },

    async getLowStockRows(page, pageSize) {
      const pagination = addPaginationOffset(page, pageSize);
      const rows = await reorderRepository.listLowStockRows(pool, pagination.page, pagination.pageSize);
      const totalRows =
        pagination.page === 1 && rows.length < pagination.pageSize
          ? rows.length
          : await reorderRepository.countLowStockRows(pool);
      return {
        rows: rows.map(reorderEntity.toLowStockRow),
        totalRows
      };
    }
  };
}
