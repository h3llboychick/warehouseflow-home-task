import { MySqlContainer } from "@testcontainers/mysql";
import mysql from "mysql2/promise";
import {
  findGroupedVendorSummary,
} from "../src/repositories/reorderRepository.js";
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

// mirrors mysql/init/001_schema.sql
const CREATE_BINS = `
  CREATE TABLE bins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(32) NOT NULL,
    aisle VARCHAR(16) NOT NULL,
    sku VARCHAR(32) NOT NULL,
    on_hand_quantity INT NOT NULL,
    reserved_quantity INT NOT NULL DEFAULT 0,
    reorder_point INT NOT NULL,
    vendor_name VARCHAR(64) NOT NULL,
    is_low_stock TINYINT(1) AS (on_hand_quantity < reorder_point) STORED
  )
`;

describe("findGroupedVendorSummary()", () => {
  let container;
  let pool;

  before(async () => {
    container = await new MySqlContainer("mysql:8")
      .withDatabase("warehouse")
      .withRootPassword("test")
      .start();

    pool = mysql.createPool({
      host: container.getHost(),
      port: container.getMappedPort(3306),
      database: "warehouse",
      user: "root",
      password: "test"
    });

    await pool.query(CREATE_BINS);
  });

  after(async () => {
    await pool.end();
    await container.stop();
  });

  describe("when the bins table has no rows", () => {
    beforeEach(async () => {
      await pool.query("DELETE FROM bins");
    });
    it("returns an empty array for grouped vendor summary (page 1)", async () => {
      const rows = await findGroupedVendorSummary(pool, 1, 10);
      assert.deepEqual(rows, []);
    });
  });

  describe("when there are more vendor groups than page size", () => {
    async function seedVendorBins() {
      await pool.query("DELETE FROM bins");

      // Globex: 9 low-stock bins  (on_hand < reorder_point)
      const globexBins = Array.from({ length: 9 }, (_, i) => [
        `B-01-0${i + 1}`, "B1", `SKU-20${i}`, 1, 0, 6, "Globex"
      ]);

      // Initech: 9 low-stock bins
      const initechBins = Array.from({ length: 9 }, (_, i) => [
        `C-01-0${i + 1}`, "C1", `SKU-30${i}`, 1, 0, 10, "Initech"
      ]);

      // Northwind: 1 low-stock bin
      const northwindBins = [["A-01-01", "A1", "SKU-100", 2, 0, 5, "Northwind"]];

      for (const bin of [...globexBins, ...initechBins, ...northwindBins]) {
        await pool.query(
          "INSERT INTO bins (code, aisle, sku, on_hand_quantity, reserved_quantity, reorder_point, vendor_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
          bin
        );
      }
    }

    beforeEach(async () => {
      await seedVendorBins();
    });

    it("page 1 contains all three vendor groups when page size equals number of groups", async () => {
      // With pageSize=3 (equal to the number of distinct vendors) every group should appear on page 1.
      const rows = await findGroupedVendorSummary(pool, 1, 3);
      const vendorNames = rows.map(r => r.vendor_name).sort();
      assert.deepEqual(vendorNames, ["Globex", "Initech", "Northwind"]);
    });

    it("page 2 with pageSize=2 drops Globex and Initech from the grouped result", async () => {
      const rows = await findGroupedVendorSummary(pool, 2, 2);
      const vendorNames = rows.map(r => r.vendor_name).sort();

      assert.deepEqual(
        vendorNames,
        ["Northwind"],
      );
    });

    it("groups across all low-stock rows before pagination", async () => {
  const rows = await findGroupedVendorSummary(pool, 1, 10);

  const byVendor = Object.fromEntries(
    rows.map(row => [
      row.vendor_name,
      {
        sku_count: Number(row.sku_count),
        total_shortage: Number(row.total_shortage),
      }
    ])
  );

  assert.deepEqual(byVendor, {
    Globex: {
      sku_count: 9,
      total_shortage: 45,
    },
    Initech: {
      sku_count: 9,
      total_shortage: 81,
    },
    Northwind: {
      sku_count: 1,
      total_shortage: 3,
    },
  });
});
  });
});
