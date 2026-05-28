import { parseInventoryFilters } from "../src/models/inventoryModel.js";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("inventoryModel.parseInventoryFilters", () => {
    it("returns empty string when aisle is absent", () => {
      const result = parseInventoryFilters({});
      assert.equal(result.aisle, "");
    });

    it("returns empty string when aisle is an empty string", () => {
      const result = parseInventoryFilters({ aisle: "" });
      assert.equal(result.aisle, "");
    });

    it("returns empty string  when aisle is undefined", () => {
        const result = parseInventoryFilters({aisle: undefined})
        assert.equal(result.aisle, "")
    })

    it("returns the aisle value when aisle is provided", () => {
      const result = parseInventoryFilters({ aisle: "A1" });
      assert.equal(result.aisle, "A1");
    });

});
