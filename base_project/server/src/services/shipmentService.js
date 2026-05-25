export function createShipmentService({ pool, shipmentRepository, shipmentEntity }) {
  return {
    async allocateShipment(shipmentId) {
      const lines = (await shipmentRepository.findShipmentLinesByShipmentId(pool, shipmentId)).map(shipmentEntity.toShipmentLine);
      const neededSkus = [...new Set(lines.map((line) => line.sku).filter(Boolean))];
      const binsBySku = new Map();
      const allBins = (await shipmentRepository.findBinsBySkus(pool, neededSkus)).map(shipmentEntity.toBin);
      for (const bin of allBins) {
        const bins = binsBySku.get(bin.sku);
        if (bins) {
          bins.push(bin);
        } else {
          binsBySku.set(bin.sku, [bin]);
        }
      }
      const allocations = [];

      for (const line of lines) {
        let remaining = line.requested_quantity - line.allocated_quantity;
        if (remaining <= 0) {
          continue;
        }
        const bins = binsBySku.get(line.sku) || [];

        for (const bin of bins) {
          if (remaining <= 0) {
            break;
          }

          const available = bin.on_hand_quantity;
          if (available <= 0) {
            continue;
          }

          const allocated = Math.min(remaining, available);
          await shipmentRepository.incrementBinReservedQuantity(pool, bin.id, allocated);
          await shipmentRepository.incrementShipmentLineAllocation(pool, line.id, allocated);
          allocations.push(shipmentEntity.toAllocation(line.id, bin.code, allocated));
          remaining -= allocated;
        }
      }

      return allocations;
    },

    async listForDate(targetDate, timezone) {
      const rows = await shipmentRepository.listForDate(pool, targetDate, timezone);
      return rows.map(shipmentEntity.toShipment);
    },

    async listAll() {
      const rows = await shipmentRepository.listAll(pool);
      return rows.map(shipmentEntity.toShipment);
    }
  };
}
