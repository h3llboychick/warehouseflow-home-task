export function createCycleCountService({ pool, cycleCountRepository, cycleCountEntity }) {
  return {
    async listCycleCounts() {
      const rows = await cycleCountRepository.listCycleCounts(pool);
      return rows.map(cycleCountEntity.toCycleCount);
    },

    async approveRecount(id, countedQuantity) {
      await cycleCountRepository.approveRecount(pool, id, countedQuantity);
      const row = await cycleCountRepository.findCycleCountById(pool, id);
      return row ? cycleCountEntity.toCycleCount(row) : null;
    }
  };
}

