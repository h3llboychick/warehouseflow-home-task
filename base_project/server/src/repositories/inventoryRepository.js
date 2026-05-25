export async function searchBins(pool, filters) {
  const clauses = [];
  const params = [];

  if (filters.sku) {
    clauses.push("sku LIKE ?");
    params.push(`%${filters.sku}%`);
  }

  if (filters.aisle !== undefined) {
    clauses.push("aisle = ?");
    params.push(filters.aisle);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await pool.query(
    `SELECT id, code, aisle, sku, on_hand_quantity, reserved_quantity, reorder_point, vendor_name
     FROM bins
     ${where}
     ORDER BY code ASC`,
    params
  );

  return rows;
}

