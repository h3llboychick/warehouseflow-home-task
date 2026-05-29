# Solutions

## Bug 1: Shipment Allocation Ignores Reserved Stock

**What was wrong:** The allocation logic used `on_hand_quantity` as the available stock, ignoring `reserved_quantity`. This caused the system to over-allocate from bins that were already out of capacity.

**Root cause:** In `base_project/server/src/services/shipmentService.js`, the available stock formula was `const available = bin.on_hand_quantity` instead of `on_hand_quantity - reserved_quantity`.

**Fix:** Changed the formula to `const available = bin.on_hand_quantity - bin.reserved_quantity` so allocation accounts for already reserved stock.

**Test:** `base_project/server/test/shipmentService.test.js` - covers allocating only from bins that have free stock (on_hand minus reserved > 0), skipping bins where reserved equals on_hand, and splitting allocation across multiple bins when no single bin holds enough free stock.

---

## Bug 2: Shipment Dashboard Misses Late-Night Shipments

**What was wrong:** The shipments query filtered by `DATE(scheduled_at_utc)`, comparing a raw UTC timestamp against the warehouse's local date. Shipments stored just before midnight UTC but falling on the current local day (e.g. `22:30 UTC` = next calendar day in `Europe/Tallinn`, UTC+3) were excluded.

**Root cause:** `base_project/server/src/repositories/shipmentRepository.js` - the SQL `WHERE` clause used `DATE(scheduled_at_utc) = ?` without converting to the warehouse timezone first.

**Fix:** Changed to `DATE(CONVERT_TZ(scheduled_at_utc, "+00:00", warehouse_local_timezone)) = ?` so the date comparison happens in the warehouse's local timezone.

**Test:** `base_project/server/test/shipmentRepository.test.js` - two integration tests using a real MySQL container: one verifies that a shipment stored at `23:00 UTC` on January 1st is returned when querying for January 2nd in `Europe/Paris` (UTC+1); the other verifies that a shipment stored at `03:00 UTC` on January 2nd is *not* returned when querying for January 2nd in `America/New_York` (UTC-5), because that UTC time still falls on January 1st locally.

---

## Bug 3: Blank Aisle Filter Returns No Inventory Rows

**What was wrong:** When the `aisle` query parameter was omitted or left blank, it was treated as a defined value, causing an `aisle = ?` clause to be appended with an empty value, which matched nothing.

**Root cause:** Two places contributed:
- `base_project/server/src/models/inventoryModel.js` - `aisle: query.aisle` left `aisle` as `undefined` when not provided.
- `base_project/server/src/repositories/inventoryRepository.js` - `if (filters.aisle !== undefined)` fired even for an empty string received from the client, inserting a useless `aisle = ''` clause.

**Fix:**
- In `inventoryModel.js`: changed to `aisle: query.aisle || ""` so missing/blank values normalise to an empty string.
- In `inventoryRepository.js`: changed the guard to `if (filters.aisle)` so the aisle clause is only added when a non-empty value is present.

**Test:** `base_project/server/test/inventoryModel.test.js` covers `parseInventoryFilters` returning an empty string for a missing aisle. `base_project/server/test/inventoryRepository.test.js` covers `searchBins` returning all rows when aisle is blank and filtering correctly when an aisle value is provided.

---

## Bug 4: Open Discrepancy Review Count Stays Stale

**What was wrong:** After approving a discrepancy review, the open-review summary count did not update because `applyRecountResult` computed the totals from the *old* row list (`currentRows`) instead of the updated one.

**Root cause:** `base_project/client/src/lib/cycleCountState.js` - `totals: summarize(currentRows)` was called using the rows before the update, so the count never decreased.

**Fix:** Changed `summarize(currentRows)` to `summarize(nextRows)` so the totals are derived from the post-update state.

**Test:** `base_project/client/src/lib/test/cycleCountState.test.js` - verifies that after calling `applyRecountResult` with an approved row, the returned `totals.openReviews` (or equivalent summary field) reflects the new count rather than the original.

---

## Bug 5: Reorder Report Drops Vendor SKUs Across Pages

**What was wrong:** The grouped vendor summary query applied `LIMIT / OFFSET` *inside* a subquery before `GROUP BY`, so pagination cut across individual low-stock rows rather than vendor groups. A vendor whose SKUs spanned the page boundary was split across pages.

**Root cause:** `base_project/server/src/repositories/reorderRepository.js` - the function `findGroupedVendorSummaryFromLimitedRows` ran `LIMIT ? OFFSET ?` inside a derived table, then grouped the truncated result.

**Fix:**
- Rewrote the query in `reorderRepository.js` (renamed to `findGroupedVendorSummary`) to apply `GROUP BY vendor_name` over the full low-stock set first, then apply `LIMIT ? OFFSET ?` to paginate over vendor groups.
- Updated `reorderService.js` to call `findGroupedVendorSummary`.

**Test:** `base_project/server/test/reorderRepository.test.js` - verifies that when there are more vendor groups than the page size, each page contains only complete vendor entries and no vendor is split across pages.
