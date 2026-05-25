CREATE TABLE bins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL,
  aisle VARCHAR(16) NOT NULL,
  sku VARCHAR(32) NOT NULL,
  on_hand_quantity INT NOT NULL,
  reserved_quantity INT NOT NULL DEFAULT 0,
  reorder_point INT NOT NULL,
  vendor_name VARCHAR(64) NOT NULL,
  is_low_stock TINYINT(1) AS (on_hand_quantity < reorder_point) STORED,
  INDEX idx_bins_code (code),
  INDEX idx_bins_sku_code (sku, code),
  INDEX idx_bins_aisle_code (aisle, code),
  INDEX idx_bins_low_stock_vendor_sku (is_low_stock, vendor_name, sku)
);

CREATE TABLE shipments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shipment_number VARCHAR(32) NOT NULL,
  warehouse_local_timezone VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  scheduled_at_utc DATETIME NOT NULL,
  INDEX idx_shipments_local_tz_scheduled_utc (warehouse_local_timezone, scheduled_at_utc),
  INDEX idx_shipments_scheduled_utc (scheduled_at_utc)
);

CREATE TABLE shipment_lines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shipment_id INT NOT NULL,
  sku VARCHAR(32) NOT NULL,
  requested_quantity INT NOT NULL,
  allocated_quantity INT NOT NULL DEFAULT 0,
  FOREIGN KEY (shipment_id) REFERENCES shipments(id)
);

CREATE TABLE cycle_counts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bin_id INT NOT NULL,
  expected_quantity INT NOT NULL,
  counted_quantity INT NOT NULL,
  status VARCHAR(32) NOT NULL,
  counted_at DATETIME NOT NULL,
  FOREIGN KEY (bin_id) REFERENCES bins(id)
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

