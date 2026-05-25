const ALLOWED_ROLES = new Set(["admin", "operator"]);

export function createUserAdminService({ pool, userRepository, userEntity, passwordService }) {
  return {
    async listUsers() {
      const rows = await userRepository.listUsers(pool);
      return rows.map(userEntity.toUser);
    },

    async createUser({ username, password, role }) {
      if (!username || !password || !ALLOWED_ROLES.has(role)) {
        return null;
      }
      const existing = await userRepository.findUserByUsername(pool, username);
      if (existing) {
        return { duplicate: true };
      }
      const passwordHash = passwordService.hashPassword(password);
      const id = await userRepository.createUser(pool, { username, passwordHash, role });
      const created = await userRepository.findUserById(pool, id);
      return { user: userEntity.toUser(created) };
    }
  };
}

