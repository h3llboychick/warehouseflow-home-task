export function createInventoryController({ inventoryService, inventoryModel }) {
  return {
    async getInventory(req, res) {
      const filters = inventoryModel.parseInventoryFilters(req.query);
      res.json(await inventoryService.searchInventory(filters));
    }
  };
}

