# Application Fixing Issue Reproduction Guide

This guide shows how to reproduce all five issues in `application_fixing/base_project` as a user of the system.

## Start The Base Project

```bash
cd base_project
podman compose up --build
```

Open:

- UI: `http://localhost:4300`
- API: `http://localhost:3301`
- MySQL: `localhost:3311`

Before reproducing any bug, you can always click `Reset Demo State` in the app header to restore the original demo data.

## Issue 1: Shipment Allocation Over-Reserves Stock

### Expected behavior

Shipment allocation should only allocate stock that is actually free in a bin:

`available = on_hand_quantity - reserved_quantity`

### Reproduction steps

1. Open `http://localhost:4300`.
2. Click `Reset Demo State`.
3. Find the `Shipment Allocation` panel.
4. Click `Refresh SKU-100 stock snapshot`.
5. Confirm the two inventory rows shown in that panel:
   `A-01-01` has `on_hand_quantity = 10` and `reserved_quantity = 8`
   `A-01-02` has `on_hand_quantity = 4` and `reserved_quantity = 0`
6. Read the shipment row shown in that panel:
   `SHIP-1001` requests 4 units of `SKU-100`.
7. Click `Allocate SHIP-1001`.
8. Look at the `Latest Allocation Result` table.

### What you will see

The app allocates all 4 units from bin `A-01-01`.

### Why that is wrong from a user perspective

This issue is only about warehouse stock availability.

The relevant formula is:

`free stock = on_hand_quantity - reserved_quantity`

So:

- `A-01-01` has only `10 - 8 = 2` free units
- `A-01-02` has `4 - 0 = 4` free units

`SHIP-1001` needs 4 units total, so a sensible user expectation is:

- allocate 2 from `A-01-01`
- allocate 2 from `A-01-02`

The cycle-count feature is unrelated to this issue and should be ignored here.

## Issue 2: Shipment Dashboard Misses A Late-Night Shipment

### Expected behavior

The shipment dashboard for the current workshop day in `Europe/Tallinn` should include all shipments that fall on that local date.

### Reproduction steps

1. Open `http://localhost:4300`.
2. Click `Reset Demo State`.
3. In the left menu, open `Shipments`.
4. Click `Refresh Dashboard`.
5. Compare `All Shipments` with `Today's Visible Shipments`.

### What you will see

`SHIP-1001` appears in `All Shipments`, but it is missing from `Today's Visible Shipments`.

### Why that is wrong from a user perspective

After reset, `SHIP-1001` is stored at `22:30 UTC` on the previous UTC calendar day. In the warehouse's local timezone, `Europe/Tallinn`, that instant falls on the current workshop day, so warehouse staff would expect to see it in the `Today's Visible Shipments` table.

## Issue 3: Blank Aisle Filter Returns No Inventory Rows

### Expected behavior

Leaving the aisle field blank should behave the same as not filtering by aisle at all.

### Reproduction steps

1. Open `http://localhost:4300`.
2. Click `Reset Demo State`.
3. In the left menu, open `Inventory`.
4. Confirm that the inventory list is visible before applying filters.
5. In `SKU`, type `SKU-100`.
6. Leave `Aisle` blank.
7. Click `Search Inventory`.

### What you will see

The result list is empty.

### Why that is wrong from a user perspective

There are two `SKU-100` bins in the system, so a blank aisle field should not remove them from the result set.

Control check:

1. Keep `SKU = SKU-100`
2. Set `Aisle = A1`
3. Click `Search Inventory`

Rows appear again, which helps show that the blank aisle value is the thing breaking the search.

## Issue 4: Open Discrepancy Review Count Stays Stale

### Expected behavior

When a supervisor approves one discrepancy review, the open-review count should immediately drop.

### Reproduction steps

1. Open `http://localhost:4300`.
2. Click `Reset Demo State`.
3. Open `Cycle Counts`.
4. Note the displayed `Open discrepancy reviews` value. It should start at `2`.
5. Look at the `Open Discrepancy Review Queue`. It should show `A-01-02` and `B-01-01`.
6. Click `Approve Review For A-01-02`.
7. Look at the queue and the summary card again.

### What you will see

`A-01-02` leaves the open-review queue, but the summary card still shows the old open-review count.

### Why that is wrong from a user perspective

Warehouse supervisors rely on that count to know how many discrepancies still need attention. If the queue shows one open review but the summary still says two, the page cannot be trusted.

## Issue 5: Reorder Report Drops Vendor SKUs

### Expected behavior

A reorder page should show low-stock source rows separately and keep each vendor recommendation complete when grouped.

### Reproduction steps

1. Open `http://localhost:4300`.
2. Click `Reset Demo State`.
3. Open `Reorder Report`.
4. Click `Refresh Report`.
5. Inspect `Low-Stock Line Items` and note that page size is a realistic list size (`10` rows).
6. Compare that with `Grouped Vendor Recommendations (Buggy)` on the same page.
7. Click `Next` in the low-stock table footer.
8. Check grouped recommendations again.

### What you will see

At least one vendor recommendation is split across pages. The grouped table shows only part of that vendor on page 1 and continues it on page 2.

### Why that is wrong from a user perspective

Buyers expect one vendor block per page section. If `Initech` appears on page 1, all low-stock `Initech` SKUs should appear together there. Instead, pagination is applied to raw rows before grouping, so vendor blocks become partial and hard to action.

## Suggested Task Flow

For each issue:

1. Reproduce it in `base_project`.
2. Identify the smallest relevant code slice.
3. Move that slice into the matching prototype repo.
4. Reproduce the same problem there.
5. Add or run focused tests.
6. Fix the prototype.
7. Copy the patch and tests back into `base_project`.
