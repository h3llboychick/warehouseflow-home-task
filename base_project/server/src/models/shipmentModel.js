export function parseShipmentAllocationParams(params) {
  return {
    shipmentId: Number(params.shipmentId)
  };
}

export function parseShipmentTodayQuery(query, dateModel) {
  const timezone = query.timezone || "Europe/Tallinn";
  return {
    timezone,
    targetDate: query.targetDate || dateModel.formatDateInTimezone(timezone)
  };
}

