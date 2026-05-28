import { MySqlContainer } from "@testcontainers/mysql";
import mysql from "mysql2/promise";
import { searchBins } from "../src/repositories/inventoryRepository.js";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

describe("inventoryRepository.searchBins", () => {
    let container;
    let pool;

    const dbName = "warehouse";
    const dbUser = "root";
    const dbPassword = "test";

    before(async () => {
        container = await new MySqlContainer("mysql:8")
            .withDatabase(dbName)
            .withRootPassword(dbPassword)
            .start();

        pool = mysql.createPool({
            host: container.getHost(),
            port: container.getMappedPort(3306),
            database: dbName,
            user: dbUser,
            password: dbPassword
        })

        await pool.query(
            `CREATE TABLE bins (
                id INT PRIMARY KEY AUTO_INCREMENT,
                code VARCHAR(32) NOT NULL,
                aisle VARCHAR(16) NOT NULL,
                sku VARCHAR(32) NOT NULL,
                on_hand_quantity INT NOT NULL,
                reserved_quantity INT NOT NULL DEFAULT 0,
                reorder_point INT NOT NULL,
                vendor_name VARCHAR(64) NOT NULL,
                is_low_stock TINYINT(1) AS (on_hand_quantity < reorder_point) STORED
            );
        `);

        await pool.query(
            `INSERT INTO bins (code, aisle, sku, on_hand_quantity, reserved_quantity, reorder_point, vendor_name) VALUES
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
                ('C-01-09', 'C1', 'SKU-316', 4, 0, 10, 'Initech')
        `)
    });

    after(async () => {
        await pool.end();
        await container.stop();
    });

    it("returns all bins when aisle filter is empty string", async () => {
        const filter = { sku: "", aisle: "" };
        const result = await searchBins(pool, filter);
        assert.notEqual(result.length, 0);
    });

    it("returns only bins in the specified aisle", async () => {
        const filter = { sku: "", aisle: "A1" };
        const result = await searchBins(pool, filter);
        assert.ok(result.length > 0);
        assert.ok(result.every(row => row.aisle === "A1"));
    });

    it("returns only bins matching the sku filter", async () => {
        const filter = { sku: "SKU-100", aisle: "" };
        const result = await searchBins(pool, filter);
        assert.ok(result.length > 0);
        assert.ok(result.every(row => row.sku.includes("SKU-100")));
    });
});