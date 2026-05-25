export function parseRecountRequest(params, body) {
  return {
    id: Number(params.id),
    countedQuantity: Number(body.countedQuantity)
  };
}

