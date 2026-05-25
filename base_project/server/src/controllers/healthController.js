export function createHealthController({ healthService }) {
  return {
    async getHealth(_req, res) {
      res.json(await healthService.checkHealth());
    }
  };
}

