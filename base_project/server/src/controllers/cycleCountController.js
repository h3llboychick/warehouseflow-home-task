export function createCycleCountController({ cycleCountService, cycleCountModel }) {
  return {
    async getCycleCounts(_req, res) {
      res.json(await cycleCountService.listCycleCounts());
    },

    async approveRecount(req, res) {
      const { id, countedQuantity } = cycleCountModel.parseRecountRequest(req.params, req.body);
      res.json(await cycleCountService.approveRecount(id, countedQuantity));
    }
  };
}

