export function toInventoryItem(row) {
  return {
    id: Number(row.id),
    code: row.code,
    aisle: row.aisle,
    sku: row.sku,
    on_hand_quantity: Number(row.on_hand_quantity),
    reserved_quantity: Number(row.reserved_quantity),
    reorder_point: Number(row.reorder_point),
    vendor_name: row.vendor_name
  };
}

