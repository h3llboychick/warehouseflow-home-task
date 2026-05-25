export function createHealthService({ pool, healthRepository }) {
  return {
    async checkHealth() {
      await healthRepository.ping(pool);
      return { ok: true };
    }
  };
}

