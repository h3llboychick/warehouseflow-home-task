export function toCycleCount(row) {
  return {
    id: Number(row.id),
    bin_code: row.bin_code,
    expected_quantity: Number(row.expected_quantity),
    counted_quantity: Number(row.counted_quantity),
    status: row.status,
    counted_at: row.counted_at
  };
}

