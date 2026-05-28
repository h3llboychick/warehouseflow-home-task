export function parseInventoryFilters(query) {
  return {
    sku: query.sku || "",
    aisle: query.aisle || "" // fix for bug 4: validation for aisle string added
  };
}

