export function createInventoryService({ pool, inventoryRepository, inventoryEntity }) {
  return {
    async searchInventory(filters) {
      const rows = await inventoryRepository.searchBins(pool, filters);
      return rows.map(inventoryEntity.toInventoryItem);
    }
  };
}

