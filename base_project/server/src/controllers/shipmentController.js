export function createShipmentController({ shipmentService, shipmentModel, dateModel }) {
  return {
    async allocateShipment(req, res) {
      const { shipmentId } = shipmentModel.parseShipmentAllocationParams(req.params);
      const allocations = await shipmentService.allocateShipment(shipmentId);
      res.json({ allocations });
    },

    async getTodayShipments(req, res) {
      const { targetDate, timezone } = shipmentModel.parseShipmentTodayQuery(req.query, dateModel);
      res.json(await shipmentService.listForDate(targetDate, timezone));
    },

    async getAllShipments(_req, res) {
      res.json(await shipmentService.listAll());
    }
  };
}

