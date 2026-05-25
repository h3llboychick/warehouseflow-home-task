export function createDemoResetController({ demoResetService, dateModel }) {
  return {
    async resetDemoState(_req, res) {
      const currentDate = dateModel.formatDateInTimezone("Europe/Tallinn");
      res.json(await demoResetService.resetDemoState(currentDate));
    }
  };
}

