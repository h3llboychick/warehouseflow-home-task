export async function findShipmentLinesByShipmentId(pool, shipmentId) {
  const [rows] = await pool.query(
    `SELECT id, sku, requested_quantity, allocated_quantity
     FROM shipment_lines
     WHERE shipment_id = ?
       AND requested_quantity > allocated_quantity`,
    [shipmentId]
  );
  return rows;
}

export async function findBinsBySku(pool, sku) {
  const [rows] = await pool.query(
    "SELECT id, code, sku, on_hand_quantity, reserved_quantity FROM bins WHERE sku = ? ORDER BY code ASC",
    [sku]
  );
  return rows;
}

export async function findBinsBySkus(pool, skus) {
  if (!skus.length) {
    return [];
  }

  const placeholders = skus.map(() => "?").join(", ");
  const [rows] = await pool.query(
    `SELECT id, code, sku, on_hand_quantity, reserved_quantity
     FROM bins
     WHERE sku IN (${placeholders})
     ORDER BY sku ASC, code ASC`,
    skus
  );
  return rows;
}

export async function incrementBinReservedQuantity(pool, binId, quantity) {
  await pool.query("UPDATE bins SET reserved_quantity = reserved_quantity + ? WHERE id = ?", [quantity, binId]);
}

export async function incrementShipmentLineAllocation(pool, shipmentLineId, quantity) {
  await pool.query("UPDATE shipment_lines SET allocated_quantity = allocated_quantity + ? WHERE id = ?", [quantity, shipmentLineId]);
}

export async function listForDate(pool, targetDate, timezone) {
  const [rows] = await pool.query(
    `SELECT shipment_number, warehouse_local_timezone, status, scheduled_at_utc
     FROM shipments
     WHERE DATE(CONVERT_TZ(scheduled_at_utc, "+00:00", warehouse_local_timezone)) = ?
       AND warehouse_local_timezone = ?
     ORDER BY scheduled_at_utc ASC`,
    [targetDate, timezone]
  ); // fix for bug 2: added timezone correction for scheduled_at_utc using CONVERT_TZ function
  return rows;
}

export async function listAll(pool) {
  const [rows] = await pool.query(
    `SELECT shipment_number, warehouse_local_timezone, status, scheduled_at_utc
     FROM shipments
     ORDER BY scheduled_at_utc ASC`
  );
  return rows;
}
