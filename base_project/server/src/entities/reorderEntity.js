export function toVendorSummary(row) {
  return {
    vendorName: row.vendor_name,
    skuCount: Number(row.sku_count),
    totalShortage: Number(row.total_shortage)
  };
}

export function toLowStockRow(row) {
  return {
    code: row.code,
    vendorName: row.vendor_name,
    sku: row.sku,
    onHand: Number(row.on_hand_quantity),
    reorderPoint: Number(row.reorder_point),
    shortage: Number(row.shortage)
  };
}

