export function toShipment(row) {
  return {
    shipment_number: row.shipment_number,
    warehouse_local_timezone: row.warehouse_local_timezone,
    status: row.status,
    scheduled_at_utc: row.scheduled_at_utc
  };
}

export function toShipmentLine(row) {
  return {
    id: Number(row.id),
    sku: row.sku,
    requested_quantity: Number(row.requested_quantity),
    allocated_quantity: Number(row.allocated_quantity)
  };
}

export function toBin(row) {
  return {
    id: Number(row.id),
    code: row.code,
    sku: row.sku,
    on_hand_quantity: Number(row.on_hand_quantity),
    reserved_quantity: Number(row.reserved_quantity)
  };
}

export function toAllocation(lineId, binCode, allocated) {
  return {
    lineId,
    binCode,
    allocated
  };
}
