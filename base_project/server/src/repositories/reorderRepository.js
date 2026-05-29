export async function findGroupedVendorSummary(pool, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT 
        vendor_name, 
        COUNT(*) AS sku_count, 
        SUM(reorder_point - on_hand_quantity) AS total_shortage
     FROM bins
     WHERE on_hand_quantity < reorder_point
     GROUP BY vendor_name
     ORDER BY vendor_name ASC
     LIMIT ? OFFSET ?`,
    [pageSize, offset] // fix for bug 5: limit and offest should be applied after group by for paginating over vendors
  );
  return rows;
}

export async function countLowStockRows(pool) {
  const [[{ totalRows }]] = await pool.query(
    `SELECT COUNT(*) AS totalRows
     FROM bins
     WHERE on_hand_quantity < reorder_point`
  );
  return Number(totalRows);
}

export async function listLowStockRows(pool, page, pageSize) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT code, vendor_name, sku, on_hand_quantity, reorder_point, (reorder_point - on_hand_quantity) AS shortage
     FROM bins
     WHERE on_hand_quantity < reorder_point
     ORDER BY vendor_name ASC, sku ASC
     LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );
  return rows;
}

