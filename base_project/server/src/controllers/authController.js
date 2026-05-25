export function createAuthController({ authService, authModel }) {
  return {
    async login(req, res) {
      const { username, password } = authModel.parseLoginRequest(req.body);
      const session = await authService.login(username, password);
      if (!session) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      res.json(session);
    },

    async me(req, res) {
      const user = await authService.getCurrentUser(req.auth.userId);
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      res.json(user);
    }
  };
}

