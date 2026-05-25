function addDays(yyyyMmDd, days) {
  const date = new Date(`${yyyyMmDd}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createDemoResetService({ pool, demoResetRepository }) {
  return {
    async resetDemoState(currentDate) {
      await demoResetRepository.replaceExtendedLowStockBins(pool);
      await demoResetRepository.resetReservedQuantities(pool);
      await demoResetRepository.resetShipmentLineAllocations(pool);
      await demoResetRepository.resetCycleCounts(pool);

      const previousDate = addDays(currentDate, -1);
      await demoResetRepository.resetShipments(pool, previousDate, currentDate);

      return { ok: true };
    }
  };
}

