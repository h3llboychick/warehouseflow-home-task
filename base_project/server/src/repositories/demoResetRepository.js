export async function replaceExtendedLowStockBins(pool) {
  await pool.query(
    `DELETE FROM bins
     WHERE code IN (
       'B-01-03','B-01-04','B-01-05','B-01-06','B-01-07','B-01-08','B-01-09',
       'C-01-03','C-01-04','C-01-05','C-01-06','C-01-07','C-01-08','C-01-09'
     )`
  );

  await pool.query(
    `INSERT INTO bins (code, aisle, sku, on_hand_quantity, reserved_quantity, reorder_point, vendor_name) VALUES
       ('B-01-03', 'B1', 'SKU-210', 3, 0, 6, 'Globex'),
       ('B-01-04', 'B1', 'SKU-211', 2, 0, 6, 'Globex'),
       ('B-01-05', 'B1', 'SKU-212', 1, 0, 6, 'Globex'),
       ('B-01-06', 'B1', 'SKU-213', 4, 0, 7, 'Globex'),
       ('B-01-07', 'B1', 'SKU-214', 3, 0, 7, 'Globex'),
       ('B-01-08', 'B1', 'SKU-215', 2, 0, 7, 'Globex'),
       ('B-01-09', 'B1', 'SKU-216', 1, 0, 7, 'Globex'),
       ('C-01-03', 'C1', 'SKU-310', 5, 0, 10, 'Initech'),
       ('C-01-04', 'C1', 'SKU-311', 4, 0, 10, 'Initech'),
       ('C-01-05', 'C1', 'SKU-312', 3, 0, 10, 'Initech'),
       ('C-01-06', 'C1', 'SKU-313', 2, 0, 10, 'Initech'),
       ('C-01-07', 'C1', 'SKU-314', 1, 0, 10, 'Initech'),
       ('C-01-08', 'C1', 'SKU-315', 5, 0, 10, 'Initech'),
       ('C-01-09', 'C1', 'SKU-316', 4, 0, 10, 'Initech')`
  );
}

export async function resetReservedQuantities(pool) {
  await pool.query(
    `UPDATE bins
     SET reserved_quantity = CASE code
       WHEN 'A-01-01' THEN 8
       WHEN 'A-01-02' THEN 0
       WHEN 'B-01-01' THEN 0
       WHEN 'B-01-02' THEN 0
       WHEN 'C-01-01' THEN 0
       WHEN 'C-01-02' THEN 0
       ELSE reserved_quantity
     END`
  );
}

export async function resetShipmentLineAllocations(pool) {
  await pool.query(
    `UPDATE shipment_lines
     SET allocated_quantity = CASE id
       WHEN 1 THEN 0
       WHEN 2 THEN 0
       WHEN 3 THEN 0
       ELSE allocated_quantity
     END`
  );
}

export async function resetCycleCounts(pool) {
  await pool.query(
    `UPDATE cycle_counts
     SET counted_quantity = CASE id
       WHEN 1 THEN 10
       WHEN 2 THEN 1
       WHEN 3 THEN 5
       ELSE counted_quantity
     END,
     status = CASE id
       WHEN 1 THEN 'approved'
       WHEN 2 THEN 'pending_review'
       WHEN 3 THEN 'pending_review'
       ELSE status
     END`
  );
}

export async function resetShipments(pool, previousDate, currentDate) {
  await pool.query(
    `UPDATE shipments
     SET scheduled_at_utc = CASE shipment_number
       WHEN 'SHIP-1001' THEN ?
       WHEN 'SHIP-1002' THEN ?
       WHEN 'SHIP-1003' THEN ?
       ELSE scheduled_at_utc
     END`,
    [
      `${previousDate} 22:30:00`,
      `${currentDate} 08:00:00`,
      `${currentDate} 03:30:00`
    ]
  );
}
