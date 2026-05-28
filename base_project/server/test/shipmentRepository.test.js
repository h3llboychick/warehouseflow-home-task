import { MySqlContainer } from "@testcontainers/mysql";
import mysql from "mysql2/promise";
import { listForDate } from "../src/repositories/shipmentRepository.js";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

describe("shipmentService.listForDate", () => {
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
            `CREATE TABLE shipments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                shipment_number VARCHAR(32) NOT NULL,
                warehouse_local_timezone VARCHAR(64) NOT NULL,
                status VARCHAR(32) NOT NULL,
                scheduled_at_utc DATETIME NOT NULL
            )
        `);
    });

    after(async () => {
        await pool.end();
        await container.stop();
    });

    it("returns shipment that falls on target date in warehouse timezone", async () => {
        // 2026-01-01 23:00 UTC = 2026-01-02 in UTC+1 (Europe/Paris)
        await pool.query(`INSERT INTO shipments (shipment_number, warehouse_local_timezone, status, scheduled_at_utc) VALUES ('SHP-001', 'Europe/Paris', 'pending', '2026-01-01 23:00:00')`);        

        const result = await listForDate(pool, "2026-01-02", "Europe/Paris");
        assert.equal(result.length, 1);
        assert.equal(result[0].shipment_number, "SHP-001");
    });

    it("excludes shipment that is on target date in UTC but not in warehouse timezone", async () => {
        // This would be 2026-01-01 in New York (UTC-5)
        await pool.query(`INSERT INTO shipments (shipment_number, warehouse_local_timezone, status, scheduled_at_utc) VALUES ('SHP-002', 'America/New_York', 'pending', '2026-01-02 03:00:00')`);        

        const result = await listForDate(pool, "2026-01-02", "America/New_York");
        assert.equal(result.length, 0);
    });
});