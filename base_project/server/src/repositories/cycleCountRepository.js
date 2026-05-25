export async function listCycleCounts(pool) {
  const [rows] = await pool.query(
    `SELECT cc.id, b.code AS bin_code, cc.expected_quantity, cc.counted_quantity, cc.status, cc.counted_at
     FROM cycle_counts cc
     JOIN bins b ON b.id = cc.bin_id
     ORDER BY cc.id ASC`
  );
  return rows;
}

export async function approveRecount(pool, id, countedQuantity) {
  await pool.query(
    "UPDATE cycle_counts SET counted_quantity = ?, status = 'approved' WHERE id = ?",
    [countedQuantity, id]
  );
}

export async function findCycleCountById(pool, id) {
  const [rows] = await pool.query(
    `SELECT cc.id, b.code AS bin_code, cc.expected_quantity, cc.counted_quantity, cc.status, cc.counted_at
     FROM cycle_counts cc
     JOIN bins b ON b.id = cc.bin_id
     WHERE cc.id = ?`,
    [id]
  );
  return rows[0] || null;
}

