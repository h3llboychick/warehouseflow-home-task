export function createAuthService({ pool, userRepository, userEntity, passwordService, tokenService }) {
  return {
    async login(username, password) {
      const row = await userRepository.findUserByUsername(pool, username);
      if (!row) {
        return null;
      }

      const user = userEntity.toAuthUser(row);
      if (!user.is_active) {
        return null;
      }

      const valid = passwordService.verifyPassword(password, user.password_hash);
      if (!valid) {
        return null;
      }

      const token = tokenService.signAccessToken(user);
      return {
        accessToken: token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };
    },

    async getCurrentUser(userId) {
      const row = await userRepository.findUserById(pool, userId);
      return row ? userEntity.toUser(row) : null;
    }
  };
}

