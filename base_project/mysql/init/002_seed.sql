INSERT INTO bins (code, aisle, sku, on_hand_quantity, reserved_quantity, reorder_point, vendor_name) VALUES
  ('A-01-01', 'A1', 'SKU-100', 10, 8, 5, 'Northwind'),
  ('A-01-02', 'A1', 'SKU-100', 4, 0, 5, 'Northwind'),
  ('B-01-01', 'B1', 'SKU-200', 3, 0, 6, 'Globex'),
  ('B-01-02', 'B1', 'SKU-201', 2, 0, 6, 'Globex'),
  ('B-01-03', 'B1', 'SKU-210', 3, 0, 6, 'Globex'),
  ('B-01-04', 'B1', 'SKU-211', 2, 0, 6, 'Globex'),
  ('B-01-05', 'B1', 'SKU-212', 1, 0, 6, 'Globex'),
  ('B-01-06', 'B1', 'SKU-213', 4, 0, 7, 'Globex'),
  ('B-01-07', 'B1', 'SKU-214', 3, 0, 7, 'Globex'),
  ('B-01-08', 'B1', 'SKU-215', 2, 0, 7, 'Globex'),
  ('B-01-09', 'B1', 'SKU-216', 1, 0, 7, 'Globex'),
  ('C-01-01', 'C1', 'SKU-300', 9, 0, 10, 'Initech'),
  ('C-01-02', 'C1', 'SKU-301', 4, 0, 10, 'Initech'),
  ('C-01-03', 'C1', 'SKU-310', 5, 0, 10, 'Initech'),
  ('C-01-04', 'C1', 'SKU-311', 4, 0, 10, 'Initech'),
  ('C-01-05', 'C1', 'SKU-312', 3, 0, 10, 'Initech'),
  ('C-01-06', 'C1', 'SKU-313', 2, 0, 10, 'Initech'),
  ('C-01-07', 'C1', 'SKU-314', 1, 0, 10, 'Initech'),
  ('C-01-08', 'C1', 'SKU-315', 5, 0, 10, 'Initech'),
  ('C-01-09', 'C1', 'SKU-316', 4, 0, 10, 'Initech');

INSERT INTO shipments (shipment_number, warehouse_local_timezone, status, scheduled_at_utc) VALUES
  ('SHIP-1001', 'Europe/Tallinn', 'scheduled', '2026-04-16 22:30:00'),
  ('SHIP-1002', 'Europe/Tallinn', 'scheduled', '2026-04-17 08:00:00'),
  ('SHIP-1003', 'America/New_York', 'scheduled', '2026-04-17 03:30:00');

INSERT INTO shipment_lines (shipment_id, sku, requested_quantity, allocated_quantity) VALUES
  (1, 'SKU-100', 4, 0),
  (2, 'SKU-200', 2, 0),
  (3, 'SKU-301', 3, 0);

INSERT INTO cycle_counts (bin_id, expected_quantity, counted_quantity, status, counted_at) VALUES
  (1, 10, 10, 'approved', '2026-04-16 09:00:00'),
  (2, 4, 1, 'pending_review', '2026-04-16 09:10:00'),
  (3, 3, 5, 'pending_review', '2026-04-16 09:15:00');

INSERT INTO users (username, password_hash, role, is_active) VALUES
  ('admin', 'scrypt$depotflowsalt$d264d76c77e31fab304161bf3385b8b9444d2b8a6de1eebc9ac2f840edbbb505ccc1aa8eec7434aeb5af0dea9c2e897a188e886db37882e3a53a167c6a42f38a', 'admin', 1),
  ('operator', 'scrypt$depotflowsalt$7f7f4dc493d6b95b87a9fc296dd65d80284121dabb8275bfc9e1560292620e9072f84d7fe5488565ecdc955a5f8fa058261ab237db6b390f1508d1bce23061b7', 'operator', 1);

