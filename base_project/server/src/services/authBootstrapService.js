export function createAuthBootstrapService({ pool, userRepository, passwordService }) {
  return {
    async ensureDefaults() {
      await userRepository.ensureUsersTable(pool);

      const admin = await userRepository.findUserByUsername(pool, "admin");
      if (!admin) {
        await userRepository.createUser(pool, {
          username: "admin",
          passwordHash: passwordService.hashPassword("admin123"),
          role: "admin"
        });
      }

      const operator = await userRepository.findUserByUsername(pool, "operator");
      if (!operator) {
        await userRepository.createUser(pool, {
          username: "operator",
          passwordHash: passwordService.hashPassword("operator123"),
          role: "operator"
        });
      }
    }
  };
}

