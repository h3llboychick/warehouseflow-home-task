export function createReorderController({ reorderService, reorderModel }) {
  return {
    async getGroupedVendorSummary(req, res) {
      const { page, pageSize } = reorderModel.parseGroupedReportPagination(req.query);
      res.json(await reorderService.getGroupedVendorSummary(page, pageSize));
    },

    async getLowStockRows(req, res) {
      const { page, pageSize } = reorderModel.parseLowStockPagination(req.query);
      res.json(await reorderService.getLowStockRows(page, pageSize));
    }
  };
}

