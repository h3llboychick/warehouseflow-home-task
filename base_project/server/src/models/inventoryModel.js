export function parseInventoryFilters(query) {
  return {
    sku: query.sku || "",
    aisle: query.aisle
  };
}

